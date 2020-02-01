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
			if (index < item.length) index = item.length
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
			zero = one = 0//每次循环初始化
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
		let max = data.max//最大row长度
		
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
		return {
			matrix: matrix,
			cj: cj,
			cb: cb
		}
	}
	
}

let m = new Init
// console.log('fun:', stantard(data))
let stan = m.stantard(data)
let arti = m.artificial(stan)
let tab = m.createTable(arti)
console.log(tab)
