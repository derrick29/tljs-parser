const DICTIONARY = {
    "hayaan": "VAR_DECLARATION",
    "=": "ASSIGNMENT",
    ";": "LINE_END",
    "iprinta": "FUNC_CALL",
    "(": "L_PAREN",
    ")": "R_PAREN",
    "panksyon": "FUNC_DECLARATION",
    ":": "FUNC_START",
    "tapos": "FUNC_END"
}

class Lexer {
    constructor(input) {
        this.input = input;
        this.cursor = 0;
        this.tokens = [];
        this.char = this.input[this.cursor];
    }

    next() {
        this.cursor++;
        this.char = this.input[this.cursor];
    }

    getToken() {
        let buff = "";

        const setBuffer = () => {
            buff += this.char;
            this.next()
            
        }

        if(/[a-zA-Z0-9\=\;\(\)\"\:]/.test(this.char)) {
            let type = "VAR_NAME";

            if(this.char == "\"") {
                type = "STRING_LITERAL"
            }

            if(/[\=]/.test(this.char)) {
                setBuffer();
            }

            if(/[\;\:]/.test(this.char)) {
                setBuffer();
            }

            if(/[\(\)]/.test(this.char)) {
                setBuffer();
                return {
                    type: DICTIONARY[buff] || type,
                    value: buff
                }
            }

            const rgx = type == "STRING_LITERAL" ? /[a-zA-Z0-9\" ]+/ : /[a-zA-Z0-9\"]+/;
            while(rgx.test(this.char) && this.cursor < this.input.length) {
                setBuffer();
            }

            if(!Number.isNaN(+buff)) {
                type = "NUMERIC_LITERAL";
            }

            return {
                type: DICTIONARY[buff] || type,
                value: type == "STRING_LITERAL" ? buff.replace(/\"/g, "") : buff
            }
        } else {
            return {
                type: "SPACE",
                value: this.char
            }
        }
    }

    lex() {
        while(this.cursor < this.input.length) {
            const token = this.getToken();
            if(token['type'] == 'SPACE') {
                this.next();
            } else {
                this.tokens.push(token);
            }
            
        }
        return this;
    }
}

module.exports = Lexer;