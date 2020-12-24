(function () {
	ROLE_A = "A";
	ROLE_B = "B";
	/**
	 * 检查结果
	 */
	function checkOver(calcPointNum, initGame, chaquerMatrix, rowIndex, columnIndex, currentRole, MAX_COLUMN, MAX_ROW) {
		let nearest5chess = {};

		let count = 0;

		chaquerMatrix.forEach((row, rIndex) => {
			row.forEach((column, cIndex) => {
				if (
					rIndex - 5 < rowIndex &&
					rIndex + 5 > rowIndex &&
					cIndex - 5 < columnIndex &&
					cIndex + 5 > columnIndex
				) {
					nearest5chess[`R${rIndex}`] = (nearest5chess[`R${rIndex}`] || "") + column;
					nearest5chess[`C${rIndex}`] = (nearest5chess[`C${rIndex}`] || "") + column;

					if (rowIndex - rIndex === columnIndex - cIndex) {
						nearest5chess[`MA`] = (nearest5chess[`MA${rIndex}`] || "") + column;
					} else if (rowIndex - rIndex === cIndex - columnIndex) {
						nearest5chess[`MI`] = (nearest5chess[`MI${rIndex}`] || "") + column;
					}

					count++;
				}
			});
		});

		const winner = Object.values(nearest5chess).some((chessStr) => {
			const matchs = chessStr.match(/(AAAAA|BBBBB)/);
			return matchs && matchs.length > 0;
        });
        
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
		} else if (count === MAX_COLUMN * MAX_ROW) {
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

	window.chessRule = {
		checkOver: checkOver,
	};
})();
