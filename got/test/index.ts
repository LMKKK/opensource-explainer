import got from '../source/index.js';
const requestBody = {"pageIndex":1,"businessLine":0,"pageSize":10,"memberType":1,"cityIdList":[],"memberId":"240000000740038935"}

async function testPost() {
	const result = await got({
		url: 'http://wxhotel-common-hd2.vip.elong.com/api/common/hotel/queryFavoritePageList',
		method: 'POST',
		json: requestBody
	}).json()
	console.log(result)
}

testPost();
