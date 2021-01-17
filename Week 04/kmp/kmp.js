/*
 * @Author: Devin
 * @Date: 2021-01-17 09:10:56
 * @LastEditTime: 2021-01-17 10:32:11
 * @LastEditors: Devin
 * @Description:
 * @email: das.devin@outlook.com
 */
function kmp(source, pattern) {
	if (!pattern) {
		return 0;
	}

	if (source.length < pattern.length) {
		return -1;
	}

	// 生成kmp表格，table表示如果没找到，回到pattern的那个位置继续向后匹配
	let table = new Array(pattern.length).fill(0);
	{
        //第一位，第二位默认是0
		let i = 1,
			j = 0;
		while (i < pattern.length) {
			if (pattern[i] === pattern[j]) {
                i++;
                j++;
                table[i] = j;
			} else {
				if (j > 0) {
                    // 如果不能匹配到最长的，就尝试匹配上一个短的, 此处代码可以替换为 j = j - 1
                    j = table[j];
				} else{
                    i++;
                }
            }
        }
        console.log(table)
	}

	{
		let i = 0,
			j = 0;
		while (i < source.length) {
			if (source[i] === pattern[j]) {
				i++;
				j++;
			} else {
				if (j > 0) {
					j = table[j];
				} else {
					i++;
				}
			}

			if (j === pattern.length) {
				return i - j;
			}
		}
		return -1;
	}
}

console.log(kmp("mississippi", "caabaaac"));