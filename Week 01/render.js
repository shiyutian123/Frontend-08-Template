/**
 * 最近比较忙，所以很多模块没时间抽离，理论上数据为公共数据，渲染棋盘的方案放在此代码中，执行规则放到各自的rule中
 */
(function () {
	const { checkOver, aiExector } = window.chessRule || {};

	let MAX_ROW = 4;
	let MAX_COLUMN = 4;
	const MODE_TP = "TP";
	const MODE_TT = "TT";

	const ROLE_A = "A";
	const ROLE_B = "B";

	/**
	 * 初始化棋盘矩阵
	 */
	function generateChaquer(rowSize, columnSize) {
		const result = [];
		for (let i = 0; i < rowSize; i++) {
			result.push(new Array(columnSize).fill("", 0, columnSize));
		}
		return result;
	}

	/**
	 * 渲染棋盘矩阵
	 */
	function renderChequer(chaquerMatrix) {
		const container = document.querySelector(".container");
		const wrapperContainer = document.createElement("div");
		wrapperContainer.classList = ["wrapper"];
		chaquerMatrix.forEach((row, rowIndex) => {
			const rowDiv = document.createElement("div");
			rowDiv.classList = ["row"];
			rowDiv.setAttribute("data-row", rowIndex);

			row.forEach((column, columnIndex) => {
				const columnSpan = document.createElement("span");
				const classList = ["cell"];
				if (rowIndex === 0) {
					classList.push("top");
				} else if (rowIndex === chaquerMatrix.length - 1) {
					classList.push("bottom");
				}

				if (columnIndex === 0) {
					classList.push("left");
				} else if (columnIndex === row.length - 1) {
					classList.push("right");
				}

				columnSpan.classList.add(...classList);
				columnSpan.setAttribute("data-row", rowIndex);
				columnSpan.setAttribute("data-column", columnIndex);

				rowDiv.appendChild(columnSpan);
			});

			wrapperContainer.appendChild(rowDiv);
		});

		container.innerHTML = "";
		container.appendChild(wrapperContainer);
	}

	/**
	 * 渲染棋子
	 */
	function renderPoint(target, html) {
		target.innerHTML = html;
	}

	/**
	 * 同步棋子矩阵
	 */
	function syncMatrixPoint(rowIndex, columnIndex) {
		if (!!chaquerMatrix[rowIndex][columnIndex]) {
			return {
				error: "PONIT_CANNOT_OVERRIDE",
				msg: `<第${rowIndex + 1}行，第${columnIndex + 1}列> 已经有值，请点击没有值的区域`,
			};
		}
		if (currentRole === ROLE_A) {
			chaquerMatrix[rowIndex][columnIndex] = "A";
		} else if (currentRole === ROLE_B) {
			chaquerMatrix[rowIndex][columnIndex] = "B";
		}
	}

	/**
	 * 获取棋子内显示的值
	 */
	function getMatrixPointText(rowIndex, columnIndex) {
		if (chaquerMatrix[rowIndex][columnIndex] === "A") {
			return '<div class="white-chess"></div>';
		} else if (chaquerMatrix[rowIndex][columnIndex] === "B") {
			return '<div class="black-chess"></div>';
		}
	}

	/**
	 * 改变当前下棋人
	 */
	function changeRole(role = ROLE_A) {
		currentRole = role;
		const roleAElement = document.querySelector('[data-role="a"]');
		const roleBElement = document.querySelector('[data-role="b"]');
		if (currentRole === ROLE_A) {
			roleAElement.classList = ["active"];
			roleBElement.classList = [];
		} else if (currentRole === ROLE_B) {
			roleAElement.classList = [];
			roleBElement.classList = ["active"];
		}
	}

	/**
	 * 计算矩阵
	 */
	function calcPointNum(text) {
		const x = new Array(MAX_ROW).fill(0, 0, MAX_ROW);
		const y = new Array(MAX_COLUMN).fill(0, 0, MAX_COLUMN);

		const xCount = new Array(MAX_ROW).fill(0, 0, MAX_ROW);
		const yCount = new Array(MAX_COLUMN).fill(0, 0, MAX_COLUMN);

		let mainDiagonal = 0;
		let minorDiagonal = 0;

		let mainCount = 0;
		let minorCount = 0;

		let count = 0;
		// 获取矩阵横轴，纵轴，对角线，组成新的矩阵，若其中存在一个是相同的，则表示赢了
		chaquerMatrix.forEach((row, rowIndex) => {
			row.forEach((column, columnIndex) => {
				if (column !== "") {
					xCount[rowIndex]++;
					yCount[columnIndex]++;
					count++;
					if (rowIndex === columnIndex) {
						mainCount++;
					}
					if (rowIndex + columnIndex === MAX_ROW - 1 && rowIndex + columnIndex === MAX_COLUMN - 1) {
						minorCount++;
					}
				}
				if (column === text) {
					x[rowIndex]++;
					y[columnIndex]++;
					if (rowIndex === columnIndex) {
						mainDiagonal++;
					}
					if (rowIndex + columnIndex === MAX_ROW - 1 && rowIndex + columnIndex === MAX_COLUMN - 1) {
						minorDiagonal++;
					}
				}
			});
		});
		return {
			x,
			xCount,
			y,
			yCount,
			minorDiagonal,
			minorCount,
			mainDiagonal,
			mainCount,
			count,
		};
	}

	/**
	 * 判断是否需要AI
	 */
	function needAI() {
		return currentMode === MODE_TT && currentRole === ROLE_B;
	}

	/**
	 * AI执行完后，选择点
	 */
	function aiExecutePointEnter(xIndex, yIndex) {
		const cellElement = document.querySelector(`[data-row="${xIndex}"][data-column="${yIndex}"]`);
		executePointEnter(cellElement, xIndex, yIndex);
	}

	/**
	 * 获取当前棋子可能成型的最大值
	 */
	function getMaxCount(roleCalc) {
		const { x, xCount, y, yCount, minorDiagonal, minorCount, mainDiagonal, mainCount, count } = roleCalc;
		const maxCount = Math.max(
			...x.map((xC, xIndex) => (xCount[xIndex] === xC ? xC : 0)),
			...y.map((yC, yIndex) => (yCount[yIndex] === yC ? yC : 0)),
			minorCount === minorDiagonal ? minorDiagonal : 0,
			mainCount === mainDiagonal ? mainDiagonal : 0
		);
		return maxCount;
	}

	/**
	 * 模拟执行AI，setTimeout，短时间延时
	 */
	function aiEx() {
		if (needAI()) {
			setTimeout(() => {
				if (aiExector) {
					if (getMaxCount(calcPointNum(ROLE_A)) > getMaxCount(calcPointNum(ROLE_B))) {
						aiExector(calcPointNum(ROLE_A), aiExecutePointEnter, MAX_COLUMN, MAX_ROW);
					} else {
						aiExector(calcPointNum(ROLE_B));
					}
				} else {
					console.warn("没有注册AI执行器");
				}
			}, 100);
		}
	}

	function executePointEnter(srcElement, rowIndex, columnIndex) {
		const stop = syncMatrixPoint(rowIndex, columnIndex);
		if (stop) {
			console.error(stop.error, stop.msg);
		} else {
			renderPoint(srcElement, getMatrixPointText(rowIndex, columnIndex));

			if (checkOver) {
				const over = checkOver(calcPointNum, initGame, chaquerMatrix, rowIndex, columnIndex, currentRole, MAX_COLUMN, MAX_ROW);
				if (over) {
					console.log(over.msg);
				} else {
					changeRole(currentRole === ROLE_A ? ROLE_B : ROLE_A);
				}

				if (needAI()) {
					aiEx();
				}
			} else {
				console.warn("无法判断输赢");
			}
		}
	}

	/** 注册属性持有监听，以防止可能存在的移除和复用 */
	const containerClickListener = (event) => {
		if (needAI()) {
			return;
		}
		const srcElement = event.target;
		if (srcElement && srcElement.hasAttribute("data-row") && srcElement.hasAttribute("data-column")) {
			const rowIndex = parseInt(srcElement.getAttribute("data-row"), 10);
			const columnIndex = parseInt(srcElement.getAttribute("data-column"), 10);
			if (!isNaN(rowIndex) && !isNaN(columnIndex)) {
				executePointEnter(srcElement, rowIndex, columnIndex);
			}
		}
	};

	function addCellClickListener() {
		const container = document.querySelector(".container");
		container.addEventListener("click", containerClickListener);
	}

	const modeClickListener = (value) => {
		currentMode = value;
	};

	function addModeClickListener() {
		window.setMode = modeClickListener;
	}

	let currentRole;
	let currentMode;
	let chaquerMatrix;

	function initGame(row = MAX_ROW, column = MAX_COLUMN, mode = MODE_TT) {
		MAX_ROW = row;
		MAX_COLUMN = column;
		chaquerMatrix = generateChaquer(MAX_ROW, MAX_COLUMN);
		currentMode = MODE_TT;
		renderChequer(chaquerMatrix);
		addCellClickListener();
		addModeClickListener();
		changeRole(ROLE_A);
	}

	window.initGame = initGame;
})();
