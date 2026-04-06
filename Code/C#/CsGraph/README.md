# CsGraph

https://JimFawcett.github.io/CsGraph.html

Classes to represent directed graphs.

## Overview

`CsGraph<V,E>` is a generic directed graph built from `CsNode<V,E>` vertices connected by typed edges.
Each node holds a vertex value of type `V` and a list of `Pair<V,E>` children where `E` is the edge value type.
The graph supports depth-first walk with pluggable `Operation<V,E>` callbacks for node and edge visits.

## Structure

| Type | Role |
|---|---|
| `Pair<V,E>` | Struct holding a child node reference and an edge value |
| `CsNode<V,E>` | Graph vertex: name, value, children list, visited flag |
| `Operation<V,E>` | Base callback class — override `doNodeOp` and/or `doEdgeOp` |
| `CsGraph<V,E>` | Adjacency-list graph with depth-first `walk()` |

## Build and Run

```
dotnet build CsNode/CsNode.csproj
dotnet run --project CsNode/CsNode.csproj
```

Targets `net10.0`.

## Output

```
  Testing CsGraph class
 =======================

  starting walk at adjList[0]
  node1, 2 child nodes
  child of node1
  node2, 1 child node
  child of node2
  node4, 0 child nodes
  child of node1
  node3, 1 child node
  node5, 1 child node

  starting walk at adjList[2]
  node3,
  child of node3
  node1,
  child of node1
  node2,
  child of node2
  node4,
  node5,
```
