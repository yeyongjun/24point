/**
 * 24点游戏计算器类
 * 用于生成随机数字和验证计算结果
 */
export default class Calculator {
  /**
   * 生成随机的1-13之间的整数（模拟扑克牌）
   */
  static generateRandomNumber() {
    return Math.floor(Math.random() * 13) + 1;
  }
  
  /**
   * 生成一组随机数字（默认4个）
   */
  static generateNumbers(count = 4) {
    const numbers = [];
    for (let i = 0; i < count; i++) {
      numbers.push(this.generateRandomNumber());
    }
    return numbers;
  }
  
  /**
   * 检查给定的数字是否有解
   * 使用暴力枚举法检查是否存在解
   */
  static hasValidSolution(numbers) {
    if (numbers.length !== 4) return false;
    
    // 复制数组，避免修改原数组
    const nums = [...numbers];
    
    // 获取所有可能的数字排列
    const permutations = this.getAllPermutations(nums);
    
    // 获取所有可能的运算符组合
    const operators = ['+', '-', '*', '/'];
    const operatorCombinations = this.getAllOperatorCombinations(operators, 3);
    
    // 获取所有可能的运算顺序（括号位置）
    const computeOrders = [
      // (a op b) op (c op d)
      (a, b, c, d, op1, op2, op3) => this.compute(this.compute(a, b, op1), this.compute(c, d, op3), op2),
      // ((a op b) op c) op d
      (a, b, c, d, op1, op2, op3) => this.compute(this.compute(this.compute(a, b, op1), c, op2), d, op3),
      // (a op (b op c)) op d
      (a, b, c, d, op1, op2, op3) => this.compute(this.compute(a, this.compute(b, c, op2), op1), d, op3),
      // a op ((b op c) op d)
      (a, b, c, d, op1, op2, op3) => this.compute(a, this.compute(this.compute(b, c, op2), d, op3), op1),
      // a op (b op (c op d))
      (a, b, c, d, op1, op2, op3) => this.compute(a, this.compute(b, this.compute(c, d, op3), op2), op1)
    ];
    
    // 尝试所有可能的组合
    for (const perm of permutations) {
      for (const ops of operatorCombinations) {
        for (const computeOrder of computeOrders) {
          try {
            const result = computeOrder(perm[0], perm[1], perm[2], perm[3], ops[0], ops[1], ops[2]);
            if (Math.abs(result - 24) < 0.0001) {
              return true;
            }
          } catch (e) {
            // 忽略计算错误（如除以零）
            continue;
          }
        }
      }
    }
    
    return false;
  }
  
  /**
   * 计算两个数的运算结果
   */
  static compute(a, b, operator) {
    switch (operator) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        if (b === 0) throw new Error('除数不能为零');
        return a / b;
      default:
        throw new Error('无效的运算符');
    }
  }
  
  /**
   * 获取数组的所有排列
   */
  static getAllPermutations(arr) {
    const result = [];
    
    function permute(arr, m = []) {
      if (arr.length === 0) {
        result.push(m);
      } else {
        for (let i = 0; i < arr.length; i++) {
          const curr = [...arr];
          const next = curr.splice(i, 1);
          permute(curr, [...m, ...next]);
        }
      }
    }
    
    permute(arr);
    return result;
  }
  
  /**
   * 获取所有可能的运算符组合
   */
  static getAllOperatorCombinations(operators, count) {
    const result = [];
    
    function combine(combo = [], depth = 0) {
      if (depth === count) {
        result.push([...combo]);
        return;
      }
      
      for (let i = 0; i < operators.length; i++) {
        combo.push(operators[i]);
        combine(combo, depth + 1);
        combo.pop();
      }
    }
    
    combine();
    return result;
  }
  
  /**
   * 验证表达式是否等于24
   * 自动处理运算符优先级问题
   */
  static validateExpression(expression) {
    try {
      // 将表达式转换为数组，便于处理
      const tokens = [];
      let currentNumber = '';
      
      // 解析表达式为数字和运算符
      for (let i = 0; i < expression.length; i++) {
        const char = expression[i];
        if ('0123456789'.includes(char)) {
          currentNumber += char;
        } else if ('+-*/'.includes(char)) {
          if (currentNumber) {
            tokens.push(parseInt(currentNumber));
            currentNumber = '';
          }
          tokens.push(char);
        }
      }
      
      // 添加最后一个数字
      if (currentNumber) {
        tokens.push(parseInt(currentNumber));
      }
      
      // 确保格式正确：数字和运算符交替出现，且以数字开始和结束
      if (tokens.length !== 7 || typeof tokens[0] !== 'number' || typeof tokens[2] !== 'number' ||
          typeof tokens[4] !== 'number' || typeof tokens[6] !== 'number') {
        return false;
      }
      
      // 尝试所有可能的运算顺序
      const numbers = [tokens[0], tokens[2], tokens[4], tokens[6]];
      const operators = [tokens[1], tokens[3], tokens[5]];
      
      // 获取所有可能的运算顺序（括号位置）
      const computeOrders = [
        // (a op b) op (c op d)
        (a, b, c, d, op1, op2, op3) => this.compute(this.compute(a, b, op1), this.compute(c, d, op3), op2),
        // ((a op b) op c) op d
        (a, b, c, d, op1, op2, op3) => this.compute(this.compute(this.compute(a, b, op1), c, op2), d, op3),
        // (a op (b op c)) op d
        (a, b, c, d, op1, op2, op3) => this.compute(this.compute(a, this.compute(b, c, op2), op1), d, op3),
        // a op ((b op c) op d)
        (a, b, c, d, op1, op2, op3) => this.compute(a, this.compute(this.compute(b, c, op2), d, op3), op1),
        // a op (b op (c op d))
        (a, b, c, d, op1, op2, op3) => this.compute(a, this.compute(b, this.compute(c, d, op3), op2), op1)
      ];
      
      // 尝试所有可能的运算顺序
      for (const computeOrder of computeOrders) {
        try {
          const result = computeOrder(numbers[0], numbers[1], numbers[2], numbers[3], 
                                     operators[0], operators[1], operators[2]);
          if (Math.abs(result - 24) < 0.0001) {
            return true;
          }
        } catch (e) {
          // 忽略计算错误（如除以零）
          continue;
        }
      }
      
      return false;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * 生成一个有解的24点题目
   * @param {number} min - 数字范围最小值
   * @param {number} max - 数字范围最大值
   */
  static generateValidProblem(min = 1, max = 13) {
    let numbers;
    do {
      // 生成指定范围内的随机数
      numbers = [];
      for (let i = 0; i < 4; i++) {
        numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
      }
    } while (!this.hasValidSolution(numbers));
    
    return numbers;
  }
  
  /**
   * 获取一个可能的解法提示
   * @param {Array} numbers - 四个数字
   * @returns {string} 一个可能的解法表达式
   */
  static getHint(numbers) {
    if (numbers.length !== 4) return null;
    
    // 复制数组，避免修改原数组
    const nums = [...numbers];
    
    // 获取所有可能的数字排列
    const permutations = this.getAllPermutations(nums);
    
    // 获取所有可能的运算符组合
    const operators = ['+', '-', '*', '/'];
    const operatorCombinations = this.getAllOperatorCombinations(operators, 3);
    
    // 获取所有可能的运算顺序（括号位置）
    const computeOrders = [
      // (a op b) op (c op d)
      (a, b, c, d, op1, op2, op3) => {
        const result = this.compute(this.compute(a, b, op1), this.compute(c, d, op3), op2);
        return {
          result,
          expression: `(${a} ${this.getOperatorSymbol(op1)} ${b}) ${this.getOperatorSymbol(op2)} (${c} ${this.getOperatorSymbol(op3)} ${d})`
        };
      },
      // ((a op b) op c) op d
      (a, b, c, d, op1, op2, op3) => {
        const result = this.compute(this.compute(this.compute(a, b, op1), c, op2), d, op3);
        return {
          result,
          expression: `((${a} ${this.getOperatorSymbol(op1)} ${b}) ${this.getOperatorSymbol(op2)} ${c}) ${this.getOperatorSymbol(op3)} ${d}`
        };
      },
      // (a op (b op c)) op d
      (a, b, c, d, op1, op2, op3) => {
        const result = this.compute(this.compute(a, this.compute(b, c, op2), op1), d, op3);
        return {
          result,
          expression: `(${a} ${this.getOperatorSymbol(op1)} (${b} ${this.getOperatorSymbol(op2)} ${c})) ${this.getOperatorSymbol(op3)} ${d}`
        };
      },
      // a op ((b op c) op d)
      (a, b, c, d, op1, op2, op3) => {
        const result = this.compute(a, this.compute(this.compute(b, c, op2), d, op3), op1);
        return {
          result,
          expression: `${a} ${this.getOperatorSymbol(op1)} ((${b} ${this.getOperatorSymbol(op2)} ${c}) ${this.getOperatorSymbol(op3)} ${d})`
        };
      },
      // a op (b op (c op d))
      (a, b, c, d, op1, op2, op3) => {
        const result = this.compute(a, this.compute(b, this.compute(c, d, op3), op2), op1);
        return {
          result,
          expression: `${a} ${this.getOperatorSymbol(op1)} (${b} ${this.getOperatorSymbol(op2)} (${c} ${this.getOperatorSymbol(op3)} ${d}))`
        };
      }
    ];
    
    // 尝试所有可能的组合
    for (const perm of permutations) {
      for (const ops of operatorCombinations) {
        for (const computeOrder of computeOrders) {
          try {
            const { result, expression } = computeOrder(perm[0], perm[1], perm[2], perm[3], ops[0], ops[1], ops[2]);
            if (Math.abs(result - 24) < 0.0001) {
              return expression;
            }
          } catch (e) {
            // 忽略计算错误（如除以零）
            continue;
          }
        }
      }
    }
    
    return null;
  }
  
  /**
   * 获取运算符的显示符号
   */
  static getOperatorSymbol(operator) {
    switch (operator) {
      case '+': return '+';
      case '-': return '-';
      case '*': return '×';
      case '/': return '÷';
      default: return operator;
    }
  }
}