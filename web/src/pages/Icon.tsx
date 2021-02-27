import React from 'react';

const Icon: React.FC<{
  user?: {
    id: string
  }
}> = ({ user }) => {
  return user?.id ? (
    <div>{ user.id }</div>
  ) : (
    <div>로그인이 필요합니다</div>
  )
}

export default Icon;
