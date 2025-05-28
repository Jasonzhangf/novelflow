console.log('!!! initialData loaded !!!');

export const initialData = {
  nodes: [
    {
      id: 'start_0',
      type: 'start',
      meta: { position: { x: 50, y: 200 } },
      data: {
        type: 'start',
        title: 'Start / 开始',
        outputs: {
          type: 'object',
          properties: {
            testinput: { type: 'string', title: 'Test Input Name' }
          }
        },
        outputsValues: {
          testinput: "Default Character Name From Start"
        }
      }
    },
    {
      id: 'character_1',
      type: 'character',
      meta: { position: { x: 300, y: 200 } },
      data: {
        type: 'character',
        title: 'Character / 角色',
      }
    },
    {
      id: 'jsonmerger_2',
      type: 'jsonmerger',
      meta: { position: { x: 550, y: 200 } },
      data: {
        type: 'jsonmerger',
        title: 'JSON Merger / JSON 分拣器',
        inputs: {
          type: 'object',
          properties: {
            jsonInput1: { type: 'object', title: 'Received Character JSON' }
          }
        },
        outputs: {
          type: 'object',
          properties: {
            mergedJsonData: { type: 'object', title: 'Processed Data Out' }
          }
        },
        inputsValues: {},
        outputsValues: {
          mergedJsonData: {}
        }
      }
    },
    {
      id: 'end_3',
      type: 'end',
      meta: { position: { x: 800, y: 200 } },
      data: {
        type: 'end',
        title: 'End / 结束',
        inputs: {
          type: 'object',
          properties: {
            dataIn: { type: 'object', title: 'Final Data' }
          }
        },
        inputsValues: {}
      }
    }
  ],
  edges: [
    {
      sourceNodeID: 'start_0',
      targetNodeID: 'character_1',
      sourcePortID: 'testinput',
      targetPortID: 'nameIn'
    },
    {
      sourceNodeID: 'character_1',
      targetNodeID: 'jsonmerger_2',
      sourcePortID: 'jsonDataOut',
      targetPortID: 'jsonInput1'
    },
    {
      sourceNodeID: 'jsonmerger_2',
      targetNodeID: 'end_3',
      sourcePortID: 'mergedJsonData',
      targetPortID: 'dataIn'
    }
  ]
};
