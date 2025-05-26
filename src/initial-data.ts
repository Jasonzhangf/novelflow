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
      id: 'jsonviewer_2',
      type: 'jsonviewer',
      meta: { position: { x: 550, y: 200 } },
      data: {
        type: 'jsonviewer',
        title: 'JSON Viewer / JSON 查看器',
        inputs: {
          type: 'object',
          properties: {
            jsonDataIn: { type: 'object', title: 'Received Character JSON' }
          }
        },
        outputs: {
          type: 'object',
          properties: {
            jsonDataOut: { type: 'object', title: 'Processed Data Out' }
          }
        },
        inputsValues: {},
        outputsValues: {
          jsonDataOut: {}
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
      targetNodeID: 'jsonviewer_2',
      sourcePortID: 'jsonDataOut',
      targetPortID: 'jsonDataIn'
    },
    {
      sourceNodeID: 'jsonviewer_2',
      targetNodeID: 'end_3',
      sourcePortID: 'jsonDataOut',
      targetPortID: 'dataIn'
    }
  ]
};
