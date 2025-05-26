import { FlowNodeEntity, NodeDefine, FlowNodeJSON, FormRenderProps } from '@flowgram.ai/free-layout-editor'; // Reverted to NodeDefine
import { JsonInputNodeCanvas } from './JsonInputNodeCanvas'; // Synchronous import
import { nanoid } from 'nanoid'; // Import nanoid

// @ts-ignore
import iconJsonInputPlaceholder from '../../assets/icon-llm.jpg'; // Using a common placeholder, update if you have a specific one

// Define the type for our node data if it's more specific than FlowNodeJSON['data']
// For now, we'll assume the data structure within onAdd matches what JsonInputNode entity expects.

/**
 * @en Registry for the JSON Input node.
 * @cn JSON输入节点的注册表。
 */
export const jsonInputNodeDefine: NodeDefine = {
  type: 'jsonInput',
  name: 'JSON Input / JSON输入',
  description: 'Imports, displays, edits, and outputs JSON data. / 导入、显示、编辑和输出JSON数据。',
  icon: iconJsonInputPlaceholder,
  inputs: [], // Data is loaded via UI (import button or direct input in sidebar)
  outputs: [
    {
      key: 'jsonDataOut',
      label: 'JSON Data / JSON数据',
      type: 'object', // Outputting as an object. Consumers can stringify if needed.
    },
  ],
  defaultData: {
    title: 'JSON Input / JSON输入',
    jsonData: {}, // This will hold the actual JSON object
    displayProperties: [], // For canvas display, calculated from jsonData
    // outputsValues is managed by Flowgram, but we ensure jsonDataOut is updated.
  },
  formMeta: {
    render: (props: FormRenderProps<FlowNodeJSON>) => import('./form-meta').then(m => m.renderJsonInputForm(props)),
  },
  meta: {
    size: { width: 200, height: 100 }, // Default size, can be adjusted by allowResize
    renderKey: 'JsonInputNodeCanvasKey', // Added renderKey
  },
  isToolNode:false, // by default it's a tool node, and it's icon will be in a different place, so explicitly set it to false.
  onAdd: (): FlowNodeJSON => {
    const nodeId = `jsonInput_${nanoid(5)}`;
    const defaultTitle = 'JSON Input / JSON输入'; // Consistent title source
    const initialJsonData = {};

    return {
      id: nodeId,
      type: 'jsonInput', 
      data: {
        title: defaultTitle,
        jsonData: initialJsonData,
        displayProperties: [], 
        inputsValues: {},
        outputsValues: {
          jsonDataOut: initialJsonData,
        },
      },
      meta: { // Node instance meta, distinct from registry meta
        title: defaultTitle,
        // position, size etc. will be managed by the editor or can be defaulted here
      },
      inputs: [], // Instance inputs - matches registry's static inputs usually
      outputs: { // Instance outputs
        jsonDataOut: {
          id: 'jsonDataOut',
          key: 'jsonDataOut',
          label: 'JSON Data / JSON数据',
          type: 'object',
          description: 'The JSON data object. / JSON数据对象。',
        }
      },
    } as FlowNodeJSON;
  },
};


/**
 * @en Entity for the JSON Input node.
 * @cn JSON输入节点的实体。
 */
export class JsonInputNode extends FlowNodeEntity {
  constructor(node?: Partial<JsonInputNode>) {
    super(node);
    // Ensure initial setup when node is created or loaded
    if (!this.data.outputsValues) {
      this.data.outputsValues = { jsonDataOut: this.data.jsonData || {} };
    }
    this.onInitialize(); // Call onInitialize to set up title, display props, etc.
  }

  /**
   * @en Updates the JSON data, recalculates display properties, title, and updates outputs.
   * @cn 更新JSON数据，重新计算显示属性和标题，并更新输出。
   * @param newData The new JSON data (as an object or string).
   */
  public updateJsonData(newData: string | object): void {
    console.log(`[JsonInputNode ${this.id}] updateJsonData called with:`, newData);
    let parsedData: object;
    if (typeof newData === 'string') {
      try {
        parsedData = JSON.parse(newData);
      } catch (error) {
        console.error(`[JsonInputNode ${this.id}] Error parsing JSON string in updateJsonData:`, error);
        this.data.jsonData = { error: "Invalid JSON string / 无效的JSON字符串" };
        this.data.displayProperties = [{key: 'Error', value: 'Invalid JSON'}];
        this.data.title = "Error / 错误";
        this.updateOutputs(); // Update output with error state
        this.emitDataChange(); // Notify Flowgram about the data change
        return;
      }
    } else {
      parsedData = newData;
    }

    this.data.jsonData = parsedData;
    this.updateDisplayProperties();
    this.updateTitle();
    this.updateOutputs();
    
    // Crucially, emit data change to trigger UI refresh and downstream updates
    console.log(`[JsonInputNode ${this.id}] Emitting data change after updateJsonData. Current jsonData:`, this.data.jsonData);
    this.emitDataChange(); 
  }

  /**
   * @en Updates the properties to be displayed on the canvas.
   * @cn 更新要在画布上显示的属性。
   */
  private updateDisplayProperties(): void {
    const jsonData = this.data.jsonData || {};
    const displayProps: { key: string, value: any, chineseKey?: string }[] = [];
    if (typeof jsonData === 'object' && jsonData !== null && !jsonData.hasOwnProperty('error')) {
      for (const key in jsonData) {
        if (Object.prototype.hasOwnProperty.call(jsonData, key)) {
          // For "Chinese attribute": Using key as placeholder. 
          // Implement mapping if specific Chinese names are needed.
          let valueDisplay = (jsonData as any)[key];
          if (typeof valueDisplay === 'object') {
            valueDisplay = JSON.stringify(valueDisplay).substring(0, 40) + (JSON.stringify(valueDisplay).length > 40 ? '...' : '');
          } else {
            valueDisplay = String(valueDisplay).substring(0, 40) + (String(valueDisplay).length > 40 ? '...' : '');
          }
          displayProps.push({ key, value: valueDisplay, chineseKey: key });
          if (displayProps.length >= 3) break; // Limit for canvas display
        }
      }
    }
    this.data.displayProperties = displayProps;
    console.log(`[JsonInputNode ${this.id}] Updated displayProperties:`, this.data.displayProperties);
  }

  /**
   * @en Updates the node title based on JSON content.
   * @cn 根据JSON内容更新节点标题。
   */
  private updateTitle(): void {
    const jsonData = this.data.jsonData || {};
    let newTitle = 'JSON Input / JSON输入'; // Default

    if (typeof jsonData === 'object' && jsonData !== null && !jsonData.hasOwnProperty('error')) {
      if ((jsonData as any).Name && typeof (jsonData as any).Name === 'string') {
        newTitle = (jsonData as any).Name;
      } else {
        const keys = Object.keys(jsonData);
        if (keys.length > 0) {
          const firstKey = keys[0];
          let firstValuePreview = (jsonData as any)[firstKey];
          if (typeof firstValuePreview === 'object') {
            firstValuePreview = JSON.stringify(firstValuePreview).substring(0, 20) + '...';
          } else {
            firstValuePreview = String(firstValuePreview).substring(0, 20) + (String(firstValuePreview).length > 20 ? '...' : '');
          }
          newTitle = `${firstKey}: ${firstValuePreview}`;
        }
      }
    }
    this.data.title = newTitle;
    console.log(`[JsonInputNode ${this.id}] Updated title:`, this.data.title);
  }

  /**
   * @en Updates the output port with the current JSON data.
   * @cn 使用当前JSON数据更新输出端口。
   */
  private updateOutputs(): void {
    // Ensure outputsValues exists on data, as FlowNodeEntity might not initialize it early enough for constructor logic.
    if (!this.data.outputsValues) {
        this.data.outputsValues = {};
    }
    this.data.outputsValues['jsonDataOut'] = this.data.jsonData || {};
    console.log(`[JsonInputNode ${this.id}] Updated outputsValues:`, this.data.outputsValues);
  }

  /**
   * @en Initializes the node, especially after it's created or loaded.
   * @cn 初始化节点，尤其是在创建或加载后。
   */
  public override onInitialize(): void {
    super.onInitialize(); // Important to call super
    console.log(`[JsonInputNode ${this.id}] onInitialize called. Initial data:`, JSON.parse(JSON.stringify(this.data)));
    // Ensure jsonData exists, default to empty object if not
    if (this.data.jsonData === undefined) {
        this.data.jsonData = {};
    }
    this.updateDisplayProperties();
    this.updateTitle();
    this.updateOutputs();
    // No need to call emitDataChange() here if onInitialize is called by Flowgram during node setup,
    // as the node is just being set up. If called at other times, emitDataChange might be needed.
    console.log(`[JsonInputNode ${this.id}] onInitialize completed. Final data state:`, JSON.parse(JSON.stringify(this.data)));
  }
}
