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
   */
  static validateExpression(expression) {
    try {
      // 使用eval计算表达式的值
      // 注意：在实际生产环境中应避免使用eval，这里仅作为示例
      const result = eval(expression);
      return Math.abs(result - 24) < 0.0001;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * 生成一个有解的24点题目
   */
  static generateValidProblem() {
    let numbers;
    do {
      numbers = this.generateNumbers();
    } while (!this.hasValidSolution(numbers));
    
    return numbers;
  }
}