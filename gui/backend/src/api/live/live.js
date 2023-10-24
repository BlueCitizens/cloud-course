import request from '@/utils/request'

// 查询点播视频信息
export function startLive(courseId) {
  return request({
    url: '/live/live/start/' + courseId,
    method: 'get'
  })
}

// 查询视频信息
export function stopLive(courseId) {
  return request({
    url: '/live/live/stop/' + courseId,
    method: 'get'
  })
}

// 查询视频信息
export function getLive(courseId) {
  return request({
    url: '/live/live/' + courseId,
    method: 'get'
  })
}

// 查询视频信息
export function resetKey(courseId) {
  return request({
    url: '/live/live/reset/' + courseId,
    method: 'get'
  })
}
