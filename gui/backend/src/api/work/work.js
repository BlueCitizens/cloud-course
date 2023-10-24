import request from '@/utils/request'

// 新增作业
export function addWork(data) {
  return request({
    url: '/work/work',
    method: 'post',
    data: data
  })
}

// 查询上传历史
export function getHistory() {
  return request({
    url: '/work/work/history',
    method: 'get'
  })
}

// 查询云端文件
export function getFileByWork(id) {
  return request({
    url: '/work/file/' + id,
    method: 'get'
  })
}

// 查询云端文件
export function downloadAllFileByWork(id) {
  return request({
    url: '/work/file/download/all/' + id,
    method: 'get',
    responseType: 'blob'
  })
}

// 上传文件
export function uploadWorkFile() {
  return request({
    url: '/work/work/po',
    method: 'post'
  })
}

// 上传文件
export function deleteWorkFile(id) {
  return request({
    url: '/work/work/file/' + id,
    method: 'delete'
  })
}
