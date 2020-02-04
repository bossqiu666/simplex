let data = [
	[true, -3, 0, 1],
	[
		[-1, 4], 1, 1, 1
	],
	[
		[1, 1], -2, 1, -1
	],
	[
		[0, 9], 0, 3, 1
	]
]

class Init {
	constructor() {}
	//标准形
	stantard(data) {
		let copy = JSON.parse(JSON.stringify(data))
		let index = 0 //当前松弛变量索引
		//目标函数处理
		if (!copy[0][0]) {
			for (var i = 1; i < copy[0].length; i++) {
				copy[0][i] = -copy[0][i]
			}
		}
		//不等式变换
		//找到最大的len
		copy.forEach((item) => {
			(index < item.length) && (index = item.length)
		})
		for (var i = 1; i < copy.length; i++) {
			switch (copy[i][0][0]) {
				case -1:
					copy[i][0] = copy[i][0][1] //简化索引0的值
					for (var j = copy[i].length; j < index; j++) {
						copy[i][j] = 0 //empty填充0
					}
					copy[i][index] = 1
					index++
					break;
				case 0:
					copy[i][0] = copy[i][0][1]
					break;
				case 1:
					copy[i][0] = copy[i][0][1]
					for (var j = copy[i].length; j < index; j++) {
						copy[i][j] = 0
					}
					copy[i][index] = -1
					index++
					break;
			}
		}
		return {
			data: copy,
			max: index
		};
	}
	//加入人工变量
	artificial(data) {
		let copy = JSON.parse(JSON.stringify(data.data))
		let max = data.max //最大row长度

		//生成列向量数组
		let columnArr = [],
			inner = [] //列向量数组
		for (var i = 1; i < max; i++) {
			for (var j = 1; j < copy.length; j++) {
				inner[j - 1] = copy[j][i] || 0
			}
			columnArr[i - 1] = JSON.parse(JSON.stringify(inner))
		}

		//记录每行最后元素的坐标
		let coord = [] //每行最后元素的坐标
		for (var i = 1; i < copy.length; i++) {
			coord[i - 1] = [i, copy[i].length - 1] //行,列
		}

		//验证是否作为基变量
		let zero, one
		let coordtemp = [] //临时坐标
		let basicVar = [] //基变量
		let artificial = [] //人工变量
		for (var i = 0; i < coord.length; i++) {
			let list = columnArr[coord[i][1] - 1] //获取列(索引要减一)
			//判断此元素为1,其他元素为0
			zero = one = 0 //每次循环初始化
			for (var j = 0; j < list.length; j++) {
				switch (list[j]) {
					case 0:
						zero++;
						break;
					case 1:
						one++;
						break;
				}
			}
			if (zero == list.length - 1 && one == 1) {
				//保存基变量坐标
				basicVar.push(coord[i])
			} else {
				//添加人工变量
				//其他位置为0,最后元素为1
				for (var j = copy[coord[i][0]].length; j < max; j++) {
					copy[coord[i][0]][j] = 0
				}
				copy[coord[i][0]][max] = 1
				//保存基变量坐标
				coordtemp = [coord[i][0], max] //行,列
				basicVar.push(coordtemp)
				//保存人工变量坐标
				artificial.push(max)
				max++
			}
		}
		return {
			data: copy,
			basicVar: basicVar,
			artificial: artificial,
			max: max //最大row长度
		}
	}
	//生成单纯形表,3个变量:系数矩阵,基变量系数,目标函数系数
	createTable(data) {
		let copy = JSON.parse(JSON.stringify(data.data))
		let basicVar = data.basicVar
		let artificial = data.artificial
		let max = data.max //最大row长度

		let matrix = [] //系数矩阵
		let cj = [] //目标函数系数
		let cb = [] //基变量系数

		// 系数矩阵
		let inner = []
		for (var i = 1; i < copy.length; i++) {
			for (var j = 0; j < max; j++) {
				inner[j] = copy[i][j] || 0
			}
			matrix.push(JSON.parse(JSON.stringify(inner)))
		}
		// 目标函数系数
		for (var i = 0; i < max; i++) {
			cj[i] = 0
		}
		for (var i = 0; i < artificial.length; i++) {
			cj[artificial[i]] = -1
		}
		//基变量系数
		for (var i = 0; i < basicVar.length; i++) {
			cb[i] = cj[basicVar[i][1]]
		}
		//基变量处理

		return {
			matrix: matrix,
			cj: cj,
			cb: cb,
			basicVar: basicVar
		}
	}

}

class Conversion {
	//计算检验数sigma并且判断是否结束
	countSigma(data) {
		let cb = data.cb //基向量系数
		let cj = data.cj //目标函数系数
		let copy = data.matrix //系数矩阵

		let sigmaArr = [],
			sigma, temp
		for (var i = 1; i < cj.length; i++) {
			temp = 0 //每次循环初始化
			for (var j = 0; j < cb.length; j++) {
				temp += cb[j] * copy[j][i]
			}
			sigma = cj[i] - temp
			sigmaArr[i] = JSON.parse(JSON.stringify(sigma))
		}

		let maxSigma = 0,
			column
		for (var i = 1; i < sigmaArr.length; i++) {
			(maxSigma < sigmaArr[i]) && ((maxSigma = sigmaArr[i]) && (column = i))
		}
		return {
			matrix: copy,
			column: column,
			maxSigma: maxSigma
		}
	}
	//计算thet(西塔)
	countThet(data) {
		let matrix = data.matrix
		let column = data.column
		let thetArr = [],
			thet
		for (var i = 0; i < matrix.length; i++) {
			(matrix[i][column] <= 0) ? (thet = null) : (thet = matrix[i][0] / matrix[i][column])
			thetArr.push(JSON.parse(JSON.stringify(thet)))
		}
		//寻找最小thet
		let minThet, row
		for (var i = 0; i < thetArr.length; i++) {
			if (i == 0) {
				minThet = thetArr[0]
				row = 0
			} else {
				if (minThet == null) {
					minThet = thetArr[i]
					row = i
				} else {
					(thetArr[i] != null && thetArr[i] <= minThet) && ((minThet = thetArr[i]) && (row = i))
				}
			}
		}

		return {
			matrix: matrix,
			row: row,
			column: column,
			minThet: minThet
		}
	}
	//矩阵变换
	transform(data) {
		let matrix = data.matrix
		let row = data.row
		let column = data.column
		let copy = JSON.parse(JSON.stringify(matrix))
		let matrix2 = [],
			mainEle = copy[row][column], //主元素
			tempRow = []
		//主行变换
		if (copy[row][column] == 1) {
			matrix2[row] = JSON.parse(JSON.stringify(copy[row])) //直接拷贝行
		} else {
			for (var i = 0; i < copy[row].length; i++) {
				tempRow[i] = copy[row][i] / mainEle
			}
			matrix2[row] = tempRow
		}
		//其他行变换
		let otherEle //其他元素
		for (var i = 0; i < copy.length; i++) {
			if (i != row) {
				tempRow = [] //初始化
				otherEle = copy[i][column] //当前中心元素
				for (var j = 0; j < copy[row].length; j++) {
					tempRow[j] = copy[i][j] - copy[row][j] * otherEle / mainEle
				}
				matrix2[i] = JSON.parse(JSON.stringify(tempRow))
			}
		}
		return matrix2;
	}
	//换基变量cb
	exchangeCb(data) {
		let row = data.row;
		let column = data.column;
		let cbtemp = JSON.parse(JSON.stringify(data.cb));
		let cj = data.cj;
		let basicVartemp = JSON.parse(JSON.stringify(data.basicVar));
		cbtemp[row] = cj[column] //基变量系数变换
		basicVartemp[row] = [data.basicVar[row][0], column]
		return {
			cb: cbtemp,
			basicVar: basicVartemp
		}
	}
}

function Part1(raw) {
	let init = new Init
	let con = new Conversion
	//标准形
	let stantard = init.stantard(raw) //{data: copy,max: index}
	//加入人工变量
	let artificial = init.artificial(stantard) //{data: copy,basicVar: basicVar,artificial: artificial,max: max}
	//创建单纯形表
	let create = init.createTable(artificial) //{matrix: matrix,cj: cj,cb: cb,basicVar: basicVar}
	Part1.prototype.iteration = function(arg) { //递归
		let data = arg || create
		//计算检验数sigma并且判断是否结束
		let sigma = con.countSigma(data) //{matrix: copy,column: column,maxSigma: maxSigma}
		if (sigma.maxSigma > 0) {
			//计算thet
			let thet = con.countThet(sigma) //{matrix: matrix,row: row,column: column,minThet: minThet}
			if (thet.minThet < 0) {
				console.log('无界解,计算结束!')
			} else if (thet.minThet >= 0) {
				//矩阵变换
				let transform = con.transform(thet) //matrix2
				let cb = con.exchangeCb({
					row: thet.row,
					column: thet.column,
					cb: data.cb,
					cj: data.cj,
					basicVar: data.basicVar
				}) //cbtemp
				return Part1.prototype.iteration({
					matrix: transform,
					cb: cb.cb,
					basicVar: cb.basicVar,
					cj: data.cj
				})
			}
		} else {
			//计算结束,返回矩阵,解的情况
			// console.log('最优解,计算结束!', data.matrix)
			return {
				data: raw,
				matrix: data.matrix,
				arti: artificial.artificial,
				basicVar: data.basicVar
			}
		}
	};
}

function Part2(raw) { //{data,matrix,basicVar,arti}
	let copy = JSON.parse(JSON.stringify(raw.data))
	let matrix = JSON.parse(JSON.stringify(raw.matrix))
	let basicVar = raw.basicVar
	let artificial = raw.arti
	//去掉人工变量列
	for (var i = 0; i < matrix.length; i++) {
		for (var j = artificial.length - 1; j > -1; j--) {
			matrix[i].splice(artificial[j], 1)
		}

	}
	//目标函数处理,生成cj
	if (!copy[0][0]) {
		for (var i = 1; i < copy[0].length; i++) {
			copy[0][i] = -copy[0][i]
		}
	}
	let cj = []
	for (var i = 0; i < matrix[0].length; i++) {
		cj[i] = copy[0][i] || 0
	}
	//cb处理
	let cb = []
	for (var i = 0; i < basicVar.length; i++) {
		cb[i] = copy[0][basicVar[i][1]] || 0
	}
	let rawobj = {
		matrix: matrix,
		cb: cb,
		basicVar: basicVar,
		cj: cj
	}
	let con = new Conversion
	Part2.prototype.iteration = function(arg) { //递归
		let data = arg || rawobj
		// console.log('data:', data)
		//计算检验数sigma并且判断是否结束
		let sigma = con.countSigma(data) //{matrix: copy,column: column,maxSigma: maxSigma}
		if (sigma.maxSigma > 0) {
			//计算thet
			let thet = con.countThet(sigma) //{matrix: matrix,row: row,column: column,minThet: minThet}
			if (thet.minThet < 0) {
				console.log('无界解,计算结束!')
			} else if (thet.minThet >= 0) {
				//矩阵变换
				let transform = con.transform(thet) //matrix2
				let cb = con.exchangeCb({
					row: thet.row,
					column: thet.column,
					cb: data.cb,
					cj: data.cj,
					basicVar: data.basicVar
				}) //cbtemp
				return Part2.prototype.iteration({
					matrix: transform,
					cb: cb.cb,
					basicVar: cb.basicVar,
					cj: data.cj
				})
			}
		} else {
			//矩阵四舍五入,4为有效数字
			for (var i = 0; i < data.matrix.length; i++) {
				for (var j = 0; j < data.matrix[i].length; j++) {
					data.matrix[i][j] = Number(data.matrix[i][j].toFixed(4))
				}
			}
			//计算目标函数值
			let result = 0,
				addNum = 0
			for (var i = 1; i < data.cj.length; i++) {
				if (data.cj[i] != 0) {
					for (var j = 0; j < data.basicVar.length; j++) {
						if (i != data.basicVar[j][1]) {
							addNum = 0
						} else {
							addNum = accMul(data.matrix[j][0], data.cj[i])
						}
						result = accAdd(result, addNum)
					}
				}
			}
			if (!data.cj[0]) {
				result = -result
			}
			//计算结束,返回矩阵,解的情况
			console.log('最优解,计算结束!', data.matrix, data.basicVar, data.cj, '最值:', result)
			return {
				matrix: data.matrix,
				basicVar: data.basicVar,
				result: result
			}
		}
	}
}

//主进程
let part1 = new Part1(data)
let part2 = new Part2(part1.iteration())
part2.iteration()
