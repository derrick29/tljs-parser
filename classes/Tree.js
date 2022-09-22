class Tree {
    constructor() {
        this.root = []
    }
}

class VarNode {
    constructor(value) {
        this.ref = null;
        this.assignment = null;
        this.value = null;
    }
}

class FuncCallNode {
    constructor(value) {
        this.funcName = null;
        this.lParen = null;
        this.params = null;
        this.rParen = null;
        this.type = null;
    }
}

class FuncNode {
    constructor(value) {
        this.name = null;
        this.body = null;
    }
}

module.exports = {Tree, VarNode, FuncCallNode, FuncNode}