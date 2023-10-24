import request from '@/utils/request'

// 查询点播视频信息
export function getVod(id) {
  return request({
    url: '/vod/vod/'+id,
    method: 'get'
  })
}

// 查询点播视频信息
export function stopVod() {
  return request({
    url: '/live/live/stop',
    method: 'get'
  })
}

// 上传文件
export function uploadVideoFile() {
  return request({
    url: '/vod/vod/po',
    method: 'post'
  })
}
