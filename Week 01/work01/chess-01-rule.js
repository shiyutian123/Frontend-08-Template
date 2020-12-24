(function () {
	ROLE_A = "A";
	ROLE_B = "B";
	/**
	 * 检查结果
	 */
	function checkOver(calcPointNum, initGame, chaquerMatrix, rowIndex, columnIndex, currentRole, MAX_COLUMN, MAX_ROW) {
		const winnerRoleText = currentRole === ROLE_A ? "A" : "B";
		const { x, xCount, y, yCount, minorDiagonal, minorCount, mainDiagonal, mainCount, count } = calcPointNum(
			winnerRoleText
		);
		const winner =
			x.some((xCount) => xCount === MAX_COLUMN) ||
			y.some((yCount) => yCount === MAX_ROW) ||
			[mainDiagonal, minorDiagonal].some((diagonalCount) => diagonalCount === Math.max(MAX_COLUMN, MAX_ROW));

		if (winner) {
			const msg = `角色${currentRole} 赢得了游戏！💯`;
			setTimeout(() => {
				if (confirm(msg)) {
					initGame();
					return {
						code: "WINNER",
						msg: msg,
					};
				}
			});
		} else {
			const roleACalc = calcPointNum(ROLE_A);
			const roleBCalc = calcPointNum(ROLE_B);
			if (
				roleACalc.x.filter((xC) => xC !== 0).length === MAX_COLUMN &&
				roleACalc.y.filter((yC) => yC !== 0).length === MAX_ROW &&
				roleACalc.mainDiagonal > 0 &&
				roleACalc.minorDiagonal > 0 &&
				roleBCalc.x.filter((xC) => xC !== 0).length === MAX_COLUMN &&
				roleBCalc.y.filter((yC) => yC !== 0).length === MAX_ROW &&
				roleBCalc.mainDiagonal > 0 &&
				roleBCalc.minorDiagonal > 0
			) {
				const msg = `平局！`;
				setTimeout(() => {
					if (confirm(`平局! `)) {
						initGame();
						return {
							code: "EQ",
							msg: msg,
						};
					}
				});
			}
		}
	}

	/**
	 * AI 优先保证不输，然后争取赢
	 */
	function aiExector(roleCalc, aiExecutePointEnter, MAX_COLUMN, MAX_ROW) {
		// 判断ROLE_A的最大路径，若存在，则在最大路径上设置点
		const { x, xCount, y, yCount, minorDiagonal, minorCount, mainDiagonal, mainCount, count } = roleCalc;
		const maxCount = getMaxCount(roleCalc);
		let xIndex = x.findIndex((rowCount, xIndex) => rowCount === maxCount && xCount[xIndex] === rowCount);
		let yIndex = y.findIndex((columnCount, yIndex) => columnCount === maxCount && yCount[yIndex] === columnCount);
		if (xIndex >= 0) {
			// 判断对角线是否有值
			if (chaquerMatrix[xIndex][xIndex] === "") {
				yIndex = xIndex;
			} else if (chaquerMatrix[xIndex][MAX_ROW - xIndex - 1] === "") {
				yIndex = MAX_ROW - xIndex - 1;
			} else {
				yIndex = chaquerMatrix[xIndex].findIndex((text) => text === "");
			}
		} else if (yIndex >= 0) {
			if (chaquerMatrix[yIndex][yIndex] === "") {
				xIndex = yIndex;
			} else if (chaquerMatrix[MAX_COLUMN - yIndex - 1][xIndex] === "") {
				xIndex = MAX_COLUMN - xIndex - 1;
			} else {
				xIndex = chaquerMatrix
					.map((row) => {
						return row[yIndex];
					})
					.findIndex((text) => text === "");
			}
		} else if (maxCount === mainDiagonal && mainCount === mainDiagonal) {
			if (mainCount !== MAX_ROW) {
				xIndex = chaquerMatrix
					.map((row, rowIndex) => {
						return row[rowIndex];
					})
					.findIndex((text) => text === "");
				yIndex = xIndex;
			}
		} else if (maxCount === minorDiagonal && minorCount === minorDiagonal) {
			if (minorCount !== MAX_COLUMN) {
				xIndex = chaquerMatrix
					.map((row, rowIndex) => {
						return row[MAX_COLUMN - rowIndex - 1];
					})
					.findIndex((text) => text === "");
				yIndex = MAX_COLUMN - xIndex - 1;
			}
		} else {
			if (mainCount !== MAX_ROW) {
				xIndex = chaquerMatrix
					.map((row, rowIndex) => {
						return row[rowIndex];
					})
					.findIndex((text) => text === "");
				yIndex = xIndex;
			} else if (minorCount !== MAX_COLUMN) {
				xIndex = chaquerMatrix
					.map((row, rowIndex) => {
						return row[MAX_COLUMN - rowIndex - 1];
					})
					.findIndex((text) => text === "");
				yIndex = MAX_COLUMN - xIndex - 1;
			} else {
				xIndex = xCount.findIndex((count, rowIndex) => count !== MAX_ROW);
				yIndex = chaquerMatrix[xIndex].findIndex((text) => text === "");
			}
		}
		aiExecutePointEnter(xIndex, yIndex);
	}

	window.chessRule = {
		checkOver: checkOver,
		aiExector: aiExector,
	};
})();
