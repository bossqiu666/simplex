var obj = {
	loop:0,
	data: [
		[3, 9, 1, 0, 0, 540],
		[5, 5, 0, 1, 0, 450],
		[9, 3, 0, 0, 1, 720],
		[70, 30, 0, 0, 0, 0]
	],
	data1: [
		[2,1,1,0,12],
		[1,2,0,1,9],
		[1,1,0,0,0]
	],
	data1: [
		[6,2,0,1,0,24],
		[0,5,1,0,0,15],
		[1,1,0,0,1,5],
		[2,1,0,0,0,0]
	],
	data1: [
		[3,2,0,1,0,0,13],
		[0,1,3,0,1,0,17],
		[2,1,1,0,0,1,13],
		[1,3,4,0,0,0,0]
	],
	data1:[
		[2,1,1,0,40],
		[1,3,0,1,30],
		[3,4,0,0,0]
	],
	data1:[
		[5,2,1,0,0,40],
		[3,5,0,1,0,30],
		[-1,3,0,0,1,9],
		[2,-3,0,0,0,-4]
	],
	columnMax: function(data) {
		let max, column, z = data[data.length-1]
		for (var i = 0; i < z.length; i++) {
			if (i == 0) {
				max = z[0]
				column = 0

			} else if (z[i] != 0 && z[i] > max) {
				max = z[i]
				column = i
			}
		}
		console.log('max:', max, 'column:', column)
		if (max > 0) {
			// console.log('计算Q')
			this.countQ(data,column)
		} else{
			console.log('处理完成:' ,this.data)
		}
	},
	
	// 计算Q
	countQ: function(data,column){
		let min, row, len = data[data.length-1].length
		for (var i = 0; i < data.length-1; i++) {
			// 分母不为零
			
			(data[i][column] != 0)&&(data[i][len] = data[i][len-1]/data[i][column]);
			// data[i][len]取正数
			(data[i][len] < 0) && (data[i][len] = 10000)
			if (i == 0) {
				row = 0
				min = data[i][len] || 10000
			} else if (i > 0 && data[i][len] < min) {
				row = i
				min = data[i][len]
			}
		}
		console.log('min:', min, 'row:', row)
		let data1 = JSON.parse(JSON.stringify(data))
		// console.log( 'data1:', data1)
		this.thin(data,row,column)
	},
	
	// 当前行系数化为1
	thin: function(data,row,column){
		let multiplier = 1/data[row][column]
		for (var i = 0; i < data[row].length; i++) {
			data[row][i] = data[row][i] * multiplier
		}
		let data2 =JSON.parse(JSON.stringify(data))
		// console.log('data2:', data2)
		this.conversion(data,row,column)
	},
	
	// 其他系数化为0
	conversion:function(data,row,column){
		for (var i = 0; i < data.length; i++) {
			if (i != row) {
				let tempArr = JSON.parse(JSON.stringify(data[row])) 
				let multiplier = data[i][column]
				// 放大临时数组
				for (var j = 0; j < tempArr.length; j++) {
					tempArr[j] = tempArr[j] * multiplier
				}
				for (var k = 0; k < data[i].length; k++) {
					data[i][k] = data[i][k] - tempArr[k]
				}
				// console.log(tempArr)
			}
		}
		let data3 = JSON.parse(JSON.stringify(data))
		// console.log('data3:', data3)
		this.loop++
		// console.log(this.loop);
		(this.loop < 100) && (this.columnMax(data))
	}
	
}
obj.columnMax(obj.data)
obj1 = {}
arr = []

let out = Object.prototype.toString.call(arr)
// console.log(Object.prototype) 
console.log(Array.prototype)
console.log(typeof(Array))