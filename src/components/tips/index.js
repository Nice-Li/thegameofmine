import React from 'react';


export default (props)=>{



  return <>
    {props.tips === 'getWrong' && <p>数独已经偏离原数独，查询新数独失败，请再次尝试。如果多次尝试依然无结果，建议检查填写是否有误</p>}
    {props.tips === 'success' && <p>恭喜您完成！</p>}
  </>
}