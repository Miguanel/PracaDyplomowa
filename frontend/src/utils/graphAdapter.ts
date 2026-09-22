// utils/graphAdapter.ts

import { Edge, Node } from '@xyflow/react';

export const convertLinearAlgorithmToGraph = (linearAlgo: any) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const startNodeId = 'node-start';
    nodes.push({
        id: startNodeId,
        type: 'startNode',
        position: { x: 400, y: 50 },
        data: { label: 'START' }
    });

    let previousNodeId = startNodeId;

    linearAlgo.steps.forEach((step: any, index: number) => {
        const nodeId = `node-${index}`;
        const isCondition = step.cmd === 'COMPARE';

        nodes.push({
            id: nodeId,
            type: isCondition ? 'conditionNode' : 'actionNode',
            position: { x: 400, y: 150 + index * 160 },
            data: {
                ...step,
                label: step.cmd
            }
        });

        edges.push({
            id: `edge-${previousNodeId}-${nodeId}`,
            source: previousNodeId,
            target: nodeId,
            type: 'smoothstep'
        });

        previousNodeId = nodeId;
    });

    return { nodes, edges };
};