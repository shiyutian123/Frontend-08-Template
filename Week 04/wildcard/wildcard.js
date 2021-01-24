/*
 * @Author: Devin
 * @Date: 2021-01-17 09:10:56
 * @LastEditTime: 2021-01-17 12:37:52
 * @LastEditors: Devin
 * @Description:
 * @email: das.devin@outlook.com
 */
function kmpWildcard(source, pattern, singleWildcard = "?") {
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
				} else {
					i++;
				}
			}
		}
	}

	{
		let i = 0,
			j = 0;
		let wildcardLength = 0;
		let forWild = {};
		while (i < source.length) {
			if (
				source[i] === pattern[j] ||
				pattern[j] === singleWildcard
			) {
				// wildcardWord[j] = source[i];
				if (pattern[j] === singleWildcard) {
					wildcardLength++;
				}
				i++;
				j++;
			} else {
				if (j > 0 && !forWild[i + ":" + j]) {
					forWild[i + ":" + j] = true;
					j = table[j];
					if (wildcardLength > 0) {
						i = i - wildcardLength;
						wildcardLength = 0;
					}
					// if (j === 0) {
					//     wildcardWord = {}
					// }
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

function wildcard(source, pattern, allWildcard = "*", singleWildcard = "?") {
	let starCount = 0;
	let word = "";
	let patternWords = [];

	for (let i = 0; i < pattern.length; i++) {
		word += pattern[i];
		if (pattern[i] === allWildcard) {
			patternWords[starCount] = word.substring(0, word.length - 1);
			starCount++;
			word = "";
		}
    }
    
    if (!pattern.endsWith(allWildcard)) {
        patternWords.push(word);
    }

	if (starCount === 0) {
		if (source.length === pattern.length) {
			return kmpWildcard(source, pattern, singleWildcard) !== -1;
		} else {
			return false;
		}
	} else {
		let tempSource = source;
		const start = tempSource.substring(0, patternWords[0].length);
		if (kmpWildcard(start, patternWords[0], singleWildcard) === -1) {
			return false;
		}
		for (let i = 0; i < starCount; i++) {
			let lastIndex = 0;
			lastIndex = kmpWildcard(tempSource, patternWords[i], singleWildcard);
			if (lastIndex !== -1) {
				tempSource = tempSource.substring(lastIndex + patternWords[i].length);
			} else {
				return false;
			}
        }
        
		if (patternWords.length > starCount) {
            const end = tempSource.substring(tempSource.length - patternWords[patternWords.length - 1].length);
			return kmpWildcard(end, patternWords[patternWords.length - 1], singleWildcard) !== -1;
		}
	}
	return true;
}

// console.log(kmpWildcard("aabaacaaeaabaaac", "aab?aac", "?"));
