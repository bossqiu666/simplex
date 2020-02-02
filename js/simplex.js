let data = [
	[true, -3, 0, 1],
	[
		[-1, 4], 1, 1, 1,
	],
	[
		[1, 1], -2, 1, -1
	],
	[
		[0, 9], 0, 3, 1
	]
]

class Init {
	constructor() {
		this.data = [
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
	}
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
		// console.log(copy)
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
		// console.log(sigmaArr)

		let maxSigma = 0,
			column
		for (var i = 1; i < sigmaArr.length; i++) {
			(maxSigma < sigmaArr[i]) && ((maxSigma = sigmaArr[i]) && (column = i))
		}
		// console.log(JSON.parse(JSON.stringify(sigmaArr)))
		// console.log(maxSigma,column)
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
				(thetArr[i] != null && thetArr[i] <= minThet) && ((minThet = thetArr[i]) && (row = i))
			}
		}

		// console.log(JSON.parse(JSON.stringify(thetArr)))
		// console.log(minThet,row)
		return {
			matrix: matrix,
			row: row,
			column: column,
			minThet: minThet
		}
	}
	//矩阵变换
	transform(data) {
		// console.log(matrix, row, column)
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
		// console.log(JSON.parse(JSON.stringify(matrix2)))
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

function Part1(data) {
	let init = new Init
	let con = new Conversion
	//标准形
	let stantard = init.stantard(data) //{data: copy,max: index}
	//加入人工变量
	let artificial = init.artificial(stantard) //{data: copy,basicVar: basicVar,artificial: artificial,max: max}
	//创建单纯形表
	this.create = init.createTable(artificial) //{matrix: matrix,cj: cj,cb: cb,basicVar: basicVar}
	Part1.prototype.iteration = function(data) { //迭代
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
				// console.log({matrix:transform, cb:cb, cj:data.cj})
				return Part1.prototype.iteration({
					matrix: transform,
					cb: cb.cb,
					basicVar: cb.basicVar,
					cj: data.cj
				})
			}
		} else {
			return {
				matrix: data.matrix,
				cb: data.cb,
				cj: data.cj,
				basicVar: data.basicVar
			}
			console.log('最优解,计算结束!')
			console.log({
				matrix: data.matrix,
				cb: data.cb,
				cj: data.cj,
				basicVar: data.basicVar
			})
			//计算结束,返回矩阵,解的情况
		}
	};
}

function Part2(data) { //{data,matrix,cj,basicVar}
	let copy = JSON.parse(JSON.stringify(data.data))
	//目标函数处理
	if (!copy[0][0]) {
		for (var i = 1; i < copy[0].length; i++) {
			copy[0][i] = -copy[0][i]
		}
	}
	//cb处理
	let cb = []
	for (var i = 0; i < data.basicVar.length; i++) {
		cb[i] = copy[0][data.basicVar[i][1]]
	}
	console.log(cb)
	this.init = function() {

	}
}

let part1 = new Part1(data)
// let result = part1.iteration(part1.create)
// console.log(part1.test(part1.create))
// Part2(result)
console.log(part1.iteration(part1.create))
