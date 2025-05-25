console.log('!!! initialData loaded !!!');

export const initialData = {
  nodes: [
    {
      id: 'start_0',
      type: 'start',
      meta: { position: { x: 50, y: 100 } },
      data: {
        type: 'start',
        title: 'Start / 开始',
        outputs: {
          type: 'object',
          properties: {
            testinput: { type: 'string', title: 'Test Input' }
          }
        },
        outputsValues: {
          testinput: ""
        }
      }
    },
    {
      id: 'jsonviewer_1',
      type: 'jsonviewer',
      meta: { position: { x: 350, y: 100 } },
      data: {
        type: 'jsonviewer',
        title: 'JSON Viewer',
        inputs: {
          type: 'object',
          properties: {
            jsonDataIn: { type: 'string', title: 'Received Data' }
          }
        },
        outputs: {
          type: 'object',
          properties: {
            jsonDataOut: { type: 'string', title: 'Processed Data Out' }
          }
        },
        inputsValues: {},
        outputsValues: {
          jsonDataOut: ""
        }
      }
    },
    {
      id: 'end_0',
      type: 'end',
      meta: { position: { x: 650, y: 100 } },
      data: {
        type: 'end',
        title: 'End / 结束',
        inputs: {
          type: 'object',
          properties: {
            dataIn: { type: 'string', title: 'Final Data' }
          }
        },
        inputsValues: {}
      }
    }
  ],
  edges: [
    {
      sourceNodeID: 'start_0',
      targetNodeID: 'jsonviewer_1',
      sourcePortID: 'testinput',
      targetPortID: 'jsonDataIn'
    },
    {
      sourceNodeID: 'jsonviewer_1',
      targetNodeID: 'end_0',
      sourcePortID: 'jsonDataOut',
      targetPortID: 'dataIn'
    }
  ]
};
