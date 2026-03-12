import React, { Component } from "react";
import Node from "./Node/Node";
import { dijkstra, getNodesInShortestPathOrder } from "../algorithms/dijkstra";
import "./PathFindingVisualizer.css";

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      startNode: { row: 10, col: 15 },
      finishNode: { row: 10, col: 35 },
      mode: "ready",
    };
  }

  componentDidMount() {
    const grid = getInitialGrid();
    const { startNode, finishNode } = this.state;

    grid[startNode.row][startNode.col].isStart = true;
    grid[finishNode.row][finishNode.col].isFinish = true;

    this.setState({ grid });
  }

  handleMouseDown(row, col) {
    const { mode, grid } = this.state;
    const newGrid = grid.slice();

    if (mode === "start") {
      const oldStart = this.state.startNode;
      newGrid[oldStart.row][oldStart.col].isStart = false;
      newGrid[row][col].isStart = true;

      this.setState({
        grid: newGrid,
        startNode: { row, col },
      });
      return;
    }

    if (mode === "finish") {
      const oldFinish = this.state.finishNode;
      newGrid[oldFinish.row][oldFinish.col].isFinish = false;
      newGrid[row][col].isFinish = true;

      this.setState({
        grid: newGrid,
        finishNode: { row, col },
      });
      return;
    }

    if (mode === "wall") {
      const updatedGrid = getNewGridWithWallToggled(grid, row, col);
      this.setState({ grid: updatedGrid, mouseIsPressed: true });
    }
  }

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    if (this.state.mode !== "wall") return;

    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({ grid: newGrid });
  }

  handleMouseUp() {
    this.setState({ mouseIsPressed: false });
  }

  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }

      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
      }, 10 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    const { grid, finishNode } = this.state;
    const finish = grid[finishNode.row][finishNode.col];

    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];

        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-shortest-path";

        if (i === nodesInShortestPathOrder.length - 1) {
          if (finish.previousNode === null) {
            this.setState({ mode: "no-path" });
          } else {
            this.setState({ mode: "success" });
          }
        }
      }, 50 * i);
    }
  }

  visualizeDijkstra() {
    this.setState({ mode: "visualizing" });

    const { grid, startNode, finishNode } = this.state;

    const start = grid[startNode.row][startNode.col];
    const finish = grid[finishNode.row][finishNode.col];

    const visitedNodesInOrder = dijkstra(grid, start, finish);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finish);

    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  resetGrid() {
    const defaultStart = { row: 10, col: 15 };
    const defaultFinish = { row: 10, col: 35 };

    const grid = getInitialGrid();

    grid[defaultStart.row][defaultStart.col].isStart = true;
    grid[defaultFinish.row][defaultFinish.col].isFinish = true;

    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 50; col++) {
        const nodeEl = document.getElementById(`node-${row}-${col}`);
        if (!nodeEl) continue;

        if (row === defaultStart.row && col === defaultStart.col) {
          nodeEl.className = "node node-start";
        } else if (row === defaultFinish.row && col === defaultFinish.col) {
          nodeEl.className = "node node-finish";
        } else {
          nodeEl.className = "node";
        }
      }
    }

    this.setState({
      grid,
      startNode: defaultStart,
      finishNode: defaultFinish,
      mode: "ready",
    });
  }

  clearPath() {
    const { grid } = this.state;

    for (let row of grid) {
      for (let node of row) {
        node.isVisited = false;
        node.distance = Infinity;
        node.previousNode = null;

        const nodeEl = document.getElementById(`node-${node.row}-${node.col}`);

        if (nodeEl) {
          if (node.isStart) nodeEl.className = "node node-start";
          else if (node.isFinish) nodeEl.className = "node node-finish";
          else if (node.isWall) nodeEl.className = "node node-wall";
          else nodeEl.className = "node";
        }
      }
    }

    this.setState({ mode: "ready" });
  }

  render() {
    const { grid, mouseIsPressed } = this.state;

    return (
      <div className="app-container">
        <h1 className="main-title">Dijkstra's Pathfinding Visualizer</h1>

        <div className="top-controls">
          <button
            className="visualize-btn"
            onClick={() => this.visualizeDijkstra()}
          >
            Visualize Dijkstra's Algorithm
          </button>

          <div className="mode-panel">

            <div className="tooltip-container">
              <button onClick={() => this.clearPath()}>Clear Path</button>
              <span className="tooltip-text">Remove visited nodes but keep walls</span>
            </div>

            <div className="tooltip-container">
              <button onClick={() => this.resetGrid()}>Reset Grid</button>
              <span className="tooltip-text">Reset everything to default</span>
            </div>

            <div className="tooltip-container">
              <button onClick={() => this.setState({mode: "start"})}>Set Start Node</button>
              <span className="tooltip-text">Choose where the path begins</span>
            </div>

            <div className="tooltip-container">
              <button onClick={() => this.setState({mode: "finish"})}>Set Finish Node</button>
              <span className="tooltip-text">Choose the destination node</span>
            </div>

            <div className="tooltip-container">
              <button onClick={() => this.setState({mode: "wall"})}>Draw Walls</button>
              <span className="tooltip-text">Click and drag to create walls</span>
            </div>
       
          </div>
        </div>

        <div className="status-box">
          {this.state.mode === "ready" &&
            "✨ Grid Ready - Draw walls or set start/finish nodes"}

          {this.state.mode === "wall" &&
            "🧱 Click and drag on the grid to draw walls"}

          {this.state.mode === "start" &&
            "🟢 Click a node to place the start point"}

          {this.state.mode === "finish" &&
            "🔴 Click a node to place the finish point"}

          {this.state.mode === "visualizing" &&
            "⚡ Visualizing Dijkstra's Algorithm..."}

          {this.state.mode === "success" && "✅ Shortest Path Found"}

          {this.state.mode === "no-path" && "❌ No Path Found"}
        </div>

        <div className="grid">
          {grid.map((row, rowIdx) => (
            <div key={rowIdx}>
              {row.map((node, nodeIdx) => {
                const { row, col, isFinish, isStart, isWall } = node;

                return (
                  <Node
                    key={nodeIdx}
                    col={col}
                    row={row}
                    isFinish={isFinish}
                    isStart={isStart}
                    isWall={isWall}
                    mouseIsPressed={mouseIsPressed}
                    onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                    onMouseEnter={(row, col) => this.handleMouseEnter(row, col)}
                    onMouseUp={() => this.handleMouseUp()}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

const getInitialGrid = () => {
  const grid = [];

  for (let row = 0; row < 20; row++) {
    const currentRow = [];

    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row));
    }

    grid.push(currentRow);
  }

  return grid;
};

const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: false,
    isFinish: false,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];

  if (node.isStart || node.isFinish) return newGrid;

  const newNode = {
    ...node,
    isWall: !node.isWall,
  };

  newGrid[row][col] = newNode;

  return newGrid;
};