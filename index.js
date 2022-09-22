const fs = require('fs');
const Lexer = require('./classes/Lexer');
const {Tree, VarNode, FuncCallNode, FuncNode} = require('./classes/Tree');
const input = fs.readFileSync('./lang.tl').toString();

const lexer = (input) => {
    const lexer = new Lexer(input);
    lexer.lex();
    const tokens = lexer.tokens;
    // console.log(tokens)
    const ast = genAST(tokens);
    // console.log(JSON.stringify(ast, null, 2))
    parse(ast)
}



const parse = (ast, vars = {}) => {
    // const vars = {};
    const BUILT_IN_FUNC = {
        "iprinta": console.log
    }
    for(const child of ast['root']) {
        if(child instanceof VarNode) {
            vars[child['ref']] = child['value']
        }

        if(child instanceof FuncNode) {
            vars[child['name']] = (v) => {
                parse(child['body'], 
                {[child['params']] : v})
            };
        }

        if(child instanceof FuncCallNode) {
            let func = null;
            if(child['funcName'] in BUILT_IN_FUNC) {
                func = BUILT_IN_FUNC[child['funcName']];
            } else {
                func = vars[child['funcName']]
            }
            func(child['type'] == "VAR_NAME" ? vars[child['params']] : child['params'])
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

        if(tokens[cursor]['type'] == "VAR_NAME" && tokens[cursor + 1]['type'] == "L_PAREN" && ( cursor > 0 && tokens[cursor - 1]['type'] != "FUNC_DECLARATION")) {
            currNode = new FuncCallNode(tokens[cursor]['value']);
        }

        if(cursor > 0 && tokens[cursor - 1]['type'] == "FUNC_DECLARATION") {
            currNode = new FuncNode(tokens[cursor]['value']);
            cursor++;

            // console.log(tokens[cursor])
            

            while(tokens[cursor]['type'] != 'FUNC_END') {
                // console.log(tokens[cursor])
                if(tokens[cursor]['type'] == 'VAR_NAME') {
                    currNode['params'] = tokens[cursor]['value'];
                    cursor++;
                } else if(/[\(\)]/.test(tokens[cursor]['value'])) {
                    cursor++;
                } else if(tokens[cursor]['type'] == 'FUNC_START') {
                    cursor++;
                    const subTokens = [];
                    let tmpCursor = 0;
                    for(let i = cursor; i < tokens.length; i++) {
                        tmpCursor++;
                        subTokens.push(tokens[i]);
                        if(tokens[i + 1]['type'] == "FUNC_END") {
                            break;
                        }
                    }

                    // console.log("SSS", subTokens)

                    currNode['body'] = genAST(subTokens);
                    cursor += tmpCursor - 1;
                }else {
                    cursor++
                }

            }
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
                    if(tokens[cursor + 1]['type'] == "R_PAREN") {
                        currNode['params'] = tokens[cursor]['value'];
                    } else if(tokens[cursor + 1]['type'] == "L_PAREN") {
                        currNode['funcName'] = tokens[cursor]['value'];
                    }
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