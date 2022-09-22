const fs = require('fs');
const Lexer = require('./classes/Lexer');
const {Tree, VarNode, FuncCallNode, FuncNode} = require('./classes/Tree');
const input = fs.readFileSync('./lang.tl').toString();

const lexer = (input) => {
    const lexer = new Lexer(input);
    lexer.lex();
    const tokens = lexer.tokens;
    const ast = genAST(tokens);
    parse(ast)
}

const parse = (ast) => {
    const vars = {};
    const BUILT_IN_FUNC = {
        "iprinta": console.log
    }
    
    for(const child of ast['root']) {
        if(child instanceof VarNode) {
            vars[child['ref']] = child['value']
        }

        if(child instanceof FuncCallNode) {
            BUILT_IN_FUNC[child['funcName']](child['type'] == "VAR_NAME" ? vars[child['params']] : child['params'])
        }
    }
}

const genAST = (tokens) => {
    const tree = new Tree();
    let cursor = 0;

    let currNode = null;
    while(cursor < tokens.length) {

        if(tokens[cursor]['type'] == "VAR_DECLARATION") {
            currNode = new VarNode(tokens[cursor]['value']);
        }

        if(tokens[cursor]['type'] == "FUNC_CALL") {
            currNode = new FuncCallNode(tokens[cursor]['value']);
        }
        
        if(currNode instanceof VarNode) {
            switch(tokens[cursor]['type']) {
                case "VAR_NAME":
                    currNode['ref'] = tokens[cursor]['value'];
                    break;
                case "ASSIGNMENT":
                    currNode['assignment'] = tokens[cursor]['value'];
                    break;
                case "STRING_LITERAL":
                case "NUMERIC_LITERAL":
                    currNode['value'] = tokens[cursor]['value'];
                    break;
            }
        }

        if(currNode instanceof FuncCallNode) {
            switch(tokens[cursor]['type']) {
                case "L_PAREN":
                    currNode['lParen'] = tokens[cursor]['value'];
                    break;
                case "STRING_LITERAL":
                case "NUMERIC_LITERAL":
                case "VAR_NAME":
                    currNode['type'] = tokens[cursor]['type']
                    currNode['params'] = tokens[cursor]['value'];
                    break;
                case "R_PAREN":
                    currNode['rParen'] = tokens[cursor]['value'];
                    break;
                case "FUNC_CALL":
                    currNode['funcName'] = tokens[cursor]['value'];
                    break;
            }
        }

        if(tokens[cursor]['type'] == "LINE_END" || cursor == tokens.length - 1) {
            tree['root'].push(currNode);
            currNode = null;
        }

        cursor++
    }

    return tree;
}

const main = (input) => {
    lexer(input)
}

main(input)