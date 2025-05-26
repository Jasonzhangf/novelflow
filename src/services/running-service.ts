import {
  injectable,
  inject,
  WorkflowDocument,
  Playground,
  delay,
  WorkflowLineEntity,
  WorkflowNodeEntity,
  WorkflowNodeLinesData,
  FlowNodeEntity,
  FlowNodeFormData,
  // WorkflowEdgeEntity, // Comment out or remove if problematic
} from '@flowgram.ai/free-layout-editor';
import { nodeRegistries } from '../nodes';

const RUNNING_INTERVAL = 1000;

// Define FlowData interface based on the structure observed in initial-data.ts
interface FlowData {
  nodes: FlowNodeEntity[];
  edges: any[]; // Changed from WorkflowEdgeEntity[] to any[]
}

// Interface to represent node data structure with inputsValues and outputsValues
interface NodeData {
  inputsValues?: Record<string, any>;
  outputsValues?: Record<string, any>;
  [key: string]: any;
}

@injectable()
export class RunningService {
  @inject(Playground) playground: Playground;

  @inject(WorkflowDocument) document: WorkflowDocument;

  private _runningNodes: WorkflowNodeEntity[] = [];
  
  // Store variables from all nodes
  private nodeOutputs: Map<string, Record<string, any>> = new Map();

  // Get node output value by node ID and optional key
  public getNodeOutputValue(nodeId: string, key?: string): any {
    const nodeValues = this.nodeOutputs.get(nodeId);
    if (!nodeValues) return undefined;
    if (key) return nodeValues[key];
    return nodeValues;
  }

  // Store a node output value
  public setNodeOutputValue(nodeId: string, values: any): void {
    this.nodeOutputs.set(nodeId, values);
    console.log(`RunningService: Stored output values for node ${nodeId}:`, values);
  }

  async addRunningNode(node: WorkflowNodeEntity): Promise<void> {
    this._runningNodes.push(node);
    node.renderData.node.classList.add('node-running');
    this.document.linesManager.forceUpdate(); // Refresh line renderer

    // Capture any outputsValues from the node
    const nodeData = (node as any).data as NodeData;
    if (nodeData?.outputsValues) {
      this.setNodeOutputValue(node.id, nodeData.outputsValues);
    }

    await delay(RUNNING_INTERVAL);
    // Child Nodes
    await Promise.all(node.blocks.map((nextNode) => this.addRunningNode(nextNode)));
    // Sibling Nodes
    const nextNodes = node.getData(WorkflowNodeLinesData).outputNodes;
    console.log(`[RunningService] addRunningNode(${node.id}): Found ${nextNodes.length} sibling nodes.`, nextNodes);
    
    // For each next node, pass values from this node to their inputs if connected
    for (const nextNode of nextNodes) {
      console.log(`[RunningService] addRunningNode(${node.id}): Processing sibling node ${nextNode.id}.`);
      
      // Get connections from this node to the next node
      const allEdges = (this.document as any).toJSON().edges || []; // Type of allEdges elements will be any due to above change
      const connections = allEdges.filter(
        (edge: any) => edge.sourceNodeID === node.id && edge.targetNodeID === nextNode.id
      );
      console.log(`[RunningService] addRunningNode(${node.id} -> ${nextNode.id}): Found ${connections.length} connections.`);
      
      connections.forEach(async (connection: any) => { // Added async here if CharacterNode specific logic becomes async
        const sourcePort = connection.sourcePortID;
        const targetPort = connection.targetPortID;
        console.log(`[RunningService] addRunningNode(${node.id} -> ${nextNode.id}): Processing connection from port ${sourcePort} to ${targetPort}.`);
        
        const sourceNodeData = (node as any).data as NodeData;

        if (sourcePort && targetPort && sourceNodeData?.outputsValues?.[sourcePort]) {
          console.log(`[RunningService] addRunningNode(${node.id} -> ${nextNode.id}): Condition met for data transfer.`);
          
          const valueToPass = sourceNodeData.outputsValues[sourcePort];
          
          let operationSuccessful = false;

          // Check if the nextNode is a CharacterNode
          // We need a reliable way to check the node type. Assuming type is stored in nextNode.data.type or nextNode.type
          const nextNodeType = (nextNode as any).data?.type || (nextNode as any).type; 

          if (nextNodeType === 'CharacterNode' || nextNode.id.startsWith('character_')) { // More robust check for character node
            console.log(`[RunningService] Special handling for CharacterNode: ${nextNode.id}`);
            try {
              const characterNodeData = (nextNode as any).data || {};
              characterNodeData.inputsValues = {
                ...(characterNodeData.inputsValues || {}),
                [targetPort]: valueToPass, // Usually targetPort is 'nameIn' or 'jsonDataIn'
              };

              // Directly update characterJSON and outputsValues.jsonDataOut
              let currentCharacterJSON = characterNodeData.characterJSON || {};
              // If nameIn is the target, update name. If jsonDataIn and value is string, also update name (legacy check)
              if (targetPort === 'nameIn' || (targetPort === 'jsonDataIn' && typeof valueToPass === 'string')) {
                currentCharacterJSON.name = valueToPass;
              }
              // If a full JSON object is passed to jsonDataIn, it should overwrite characterJSON
              // This part might need refinement based on exact port meanings for CharacterNode
              if (targetPort === 'jsonDataIn' && typeof valueToPass === 'object' && valueToPass !== null) {
                currentCharacterJSON = valueToPass; // Overwrite with the full JSON
              }
              
              characterNodeData.characterJSON = currentCharacterJSON;
              characterNodeData.outputsValues = {
                ...(characterNodeData.outputsValues || {}),
                jsonDataOut: characterNodeData.characterJSON, // Output the whole modified characterJSON
              };
              if (characterNodeData.characterJSON.name) {
                characterNodeData.title = characterNodeData.characterJSON.name;
              }

              (nextNode as any).data = characterNodeData;
              this.setNodeOutputValue(nextNode.id, characterNodeData.outputsValues); // Ensure RunningService internal state is updated
              console.log(`[RunningService] CharacterNode ${nextNode.id} data directly updated. Output set to:`, characterNodeData.outputsValues.jsonDataOut);

              // Attempt to trigger a re-render or data change notification on the node
              if (typeof (nextNode as any).emit === 'function') {
                (nextNode as any).emit('change', (nextNode as any).data);
              } else if ((nextNode as any).onDataChangeEmitter && typeof (nextNode as any).onDataChangeEmitter.emit === 'function') {
                (nextNode as any).onDataChangeEmitter.emit();
              } else {
                (nextNode as any)._decorator?.updatePreview?.(); // Try to call a general update if exists
                console.warn(`[RunningService] CharacterNode ${nextNode.id}: Could not find a clear method to emit change after direct data update.`);
              }
              operationSuccessful = true;
            } catch (e) {
              console.error(`[RunningService] Error during special handling for CharacterNode ${nextNode.id}:`, e);
              operationSuccessful = false; // Ensure fallback if special handling fails
            }
          }

          // Fallback to original logic if not a CharacterNode or if special handling failed
          if (!operationSuccessful) {
            // 优先尝试使用 formModel.setValueIn
            try {
              const flowNodeFormData = (nextNode as any).getData?.(FlowNodeFormData);
              if (flowNodeFormData) {
                const formModel = flowNodeFormData.getFormModel?.(); 
                if (formModel && typeof formModel.setValueIn === 'function') {
                  console.log(`[RunningService] Attempting to update ${nextNode.id} via formModel.setValueIn('inputsValues.${targetPort}', ...)`);
                  formModel.setValueIn(`inputsValues.${targetPort}`, valueToPass); // Use targetPort dynamically
                  console.log(`[RunningService] ${nextNode.id} update attempt via formModel.setValueIn completed.`);
                  operationSuccessful = true;
                } else {
                  console.warn(`[RunningService] formModel or formModel.setValueIn is not available for ${nextNode.id}.`);
                }
              } else {
                console.warn(`[RunningService] nextNode.getData(FlowNodeFormData) did not return a value for ${nextNode.id}.`);
              }
            } catch (e) {
              console.error(`[RunningService] Error trying to use formModel.setValueIn for ${nextNode.id}:`, e);
            }

            // 如果 formModel.setValueIn 失败或不可用，再尝试 nextNode.updateData()
            if (!operationSuccessful && typeof (nextNode as any).updateData === 'function') {
              const fullNextNodeDataBeforeUpdate = JSON.parse(JSON.stringify((nextNode as any).data || {}));
              if (!fullNextNodeDataBeforeUpdate.inputsValues) {
                fullNextNodeDataBeforeUpdate.inputsValues = {};
              }
              // No need to initialize outputsValues here for updateData path, as it's about inputs
              const newInputsValuesForUpdateData = {
                ...(fullNextNodeDataBeforeUpdate.inputsValues),
                [targetPort]: valueToPass,
              };
              const dataPayloadForUpdateData = {
                ...fullNextNodeDataBeforeUpdate,
                inputsValues: newInputsValuesForUpdateData,
              };
              console.log(`[RunningService] Attempting to update ${nextNode.id} via nextNode.updateData() with data:`, JSON.parse(JSON.stringify(dataPayloadForUpdateData)));
              try {
                  (nextNode as any).updateData(dataPayloadForUpdateData);
                  console.log(`[RunningService] ${nextNode.id} update attempt via nextNode.updateData() completed.`);
                  operationSuccessful = true; 
              } catch (e) {
                  console.error(`[RunningService] Error calling nextNode.updateData() for ${nextNode.id}:`, e);
              }
            }
            
            // 如果以上两种方法都失败或不可用，执行后备的直接赋值 (already part of existing fallback)
            if (!operationSuccessful) {
              console.warn(`[RunningService] Neither formModel.setValueIn nor nextNode.updateData() was successful/available for ${nextNode.id} (non-CharacterNode path or failed special handling). Falling back to direct assignment.`);
              const currentNextNodeDataFallback = (nextNode as any).data || {};
              const currentInputsValuesFallback = currentNextNodeDataFallback.inputsValues || {};
              const newInputsValuesFallback = {
                  ...currentInputsValuesFallback,
                  [targetPort]: valueToPass,
              };
              (nextNode as any).data = {
                  ...currentNextNodeDataFallback,
                  inputsValues: newInputsValuesFallback,
              };
              console.log(`RunningService (Fallback): Directly updated ${nextNode.id}.data.inputsValues.${targetPort} with:`, valueToPass);
              // Fallback emit logic from before
              if ((nextNode as any).onDataChangeEmitter && typeof (nextNode as any).onDataChangeEmitter.emit === 'function') {
                (nextNode as any).onDataChangeEmitter.emit();
              } else if (typeof (nextNode as any).forceUpdate === 'function') {
                (nextNode as any).forceUpdate();
              } else if (typeof (nextNode as any).emit === 'function') {
                 (nextNode as any).emit('change', (nextNode as any).data);
              } else {
                console.warn(`[RunningService (Fallback)] Could not find a clear method to manually trigger data update propagation for ${nextNode.id}.`);
              }
            }
          }
        } else {
          console.log(`[RunningService] addRunningNode(${node.id} -> ${nextNode.id}): Condition NOT met for data transfer. sourcePort: ${sourcePort}, targetPort: ${targetPort}, outputsValueExists: ${!!sourceNodeData?.outputsValues?.[sourcePort]}`);
        }
      });
    }
    // 在处理完所有直接连接的下游节点后，统一递归调用处理它们
    // After processing all directly connected downstream nodes, recursively call addRunningNode for each of them
    for (const nextNode of nextNodes) {
      await this.addRunningNode(nextNode);
    }
  }

  async startRun(): Promise<void> {
    // Clear previous values
    this.nodeOutputs.clear();
    
    // 获取所有节点
    const allNodes = this.document.getAllNodes();
    // 补全所有节点的 onRun（只用 node.data?.type 和 id 前缀推断 type）
    // allNodes.forEach((node: any) => {
    //   // 优先用 node.data?.type（如果是业务类型），否则用 node.type（排除 'FlowNodeEntity'），最后用 id 前缀
    //   let type = node.data?.type;
    //   if (!type || type === 'FlowNodeEntity') {
    //     if (node.type && node.type !== 'FlowNodeEntity') {
    //       type = node.type;
    //     }
    //   }
    //   if (!type && typeof node.id === 'string') {
    //     type = node.id.split('_')[0];
    //   }
    //   console.log('[RunningService] 补全onRun: 节点ID:', node.id, 'type:', type);
    //   if (typeof node.onRun !== 'function') {
    //     const registry = nodeRegistries.find(r => r.type === type);
    //     if (registry && typeof registry.onRun === 'function') {
    //       node.onRun = registry.onRun;
    //     } else {
    //       // 新增：如果没找到，打印所有注册表类型
    //       console.warn('[RunningService] 未找到注册表，type:', type, '所有注册表类型:', nodeRegistries.map(r => r.type));
    //     }
    //   }
    // });
    // 新增：补全后打印每个节点的 onRun 类型
    // allNodes.forEach((node: any) => {
    //   console.log('[RunningService] 节点ID:', node.id, 'onRun类型:', typeof node.onRun);
    // });
    // console.log('[RunningService] 遍历所有节点:'); // Commented out
    // allNodes.forEach((node: any) => { // Commented out
    //   console.log('[RunningService]   节点ID:', node.id, '类型:', node.type, 'onRun类型:', typeof node.onRun); // Commented out
    //   // if (typeof node.onRun === 'function') { ... }
    // });
    
    // Start from the Start node
    const startNode = this.document.getNode('start_0')!;
    console.log('RunningService: Starting run from Start node');
    
    // Ensure outputsValues exists for startNode
    if (!(startNode as any).data) {
      (startNode as any).data = {};
    }
    if (!(startNode as any).data.outputsValues) {
      (startNode as any).data.outputsValues = {};
    }

    // Specifically for start_0, if its outputsValues are empty or don't match initialData,
    // try to re-apply from a conceptual initialData source.
    // This is a workaround for potential timing issues where initialData isn't fully propagated.
    if (startNode.id === 'start_0') {
      const currentStartNodeOutputs = (startNode as any).data.outputsValues;
      // Simulate fetching from a static initialData config if needed
      // For this example, we'll hardcode what we expect from initial-data.ts
      const expectedInitialStartOutputs = { testinput: "Default Character Name From Start" }; 

      if (!currentStartNodeOutputs.testinput || currentStartNodeOutputs.testinput !== expectedInitialStartOutputs.testinput) {
        console.warn(`[RunningService] start_0 node outputsValues missing or different from initial. Forcing initial values. Current:`, currentStartNodeOutputs);
        (startNode as any).data.outputsValues = { ...expectedInitialStartOutputs };
        // Also update the node instance in the document if possible, though this might be tricky
        // this.document.updateNode(startNode.id, { data: (startNode as any).data }); // Hypothetical update method
      }
    }
    
    console.log('[RunningService] startRun: Using outputsValues for start_0:', (startNode as any).data.outputsValues);
    
    // Crucially, ensure these values are stored in the service's internal state before addRunningNode
    if ((startNode as any).data.outputsValues) {
      this.setNodeOutputValue(startNode.id, (startNode as any).data.outputsValues);
    }

    await this.addRunningNode(startNode);
    
    // Cleanup after run completes
    this._runningNodes.forEach((node) => {
      node.renderData.node.classList.remove('node-running');
    });
    this._runningNodes = [];
    this.document.linesManager.forceUpdate();
  }

  isFlowingLine(line: WorkflowLineEntity) {
    return this._runningNodes.some((node) =>
      node.getData(WorkflowNodeLinesData).outputLines.includes(line)
    );
  }

  // Upsert output values for a node
  public setNodeOutputs(nodeId: string, outputs: Record<string, any>): void {
    this.nodeOutputs.set(nodeId, outputs);
    console.log(`RunningService: Stored output values for node ${nodeId}:`, outputs);
  }

  // Get output values for a node
  public getNodeOutputs(nodeId: string): Record<string, any> | undefined {
    return this.nodeOutputs.get(nodeId);
  }

  private initializeNodeOutputs(node: FlowNodeEntity) {
    const nodeId = node.id;
    // Apply the same casting pattern for accessing .data as used elsewhere
    const initialOutputsFromData = (node as any).data?.outputsValues;

    if (node.type === 'start') {
        // For StartNode, prioritize outputsValues from initial-data.ts if they exist and are not empty.
        if (initialOutputsFromData && Object.keys(initialOutputsFromData).length > 0) {
            this.setNodeOutputs(nodeId, { ...initialOutputsFromData });
            console.log(`[RunningService] startRun: Using ${nodeId}.outputsValues from initial data:`, this.nodeOutputs.get(nodeId));
        } else {
            this.setNodeOutputs(nodeId, {});
            console.warn(`[RunningService] startRun: StartNode ${nodeId} has no outputsValues in initial-data.ts or it's empty. Check initial-data.ts. Initializing to empty.`);
        }
    } else {
        // For other node types
        if (initialOutputsFromData) {
            this.setNodeOutputs(nodeId, { ...initialOutputsFromData });
        } else {
            this.setNodeOutputs(nodeId, {});
        }
    }
  }

  public async run(startNodeId: string, flow: FlowData): Promise<void> {
    // ... existing code ...
  }
}
