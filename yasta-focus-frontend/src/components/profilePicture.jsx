import React from 'react'
import { Link } from 'react-router-dom'

export default function ProfilePicture({ img_url , size = 'md' , router_link }) {

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  return (
    router_link ? (
      <Link to={router_link}>
        <div>
          <img
            src={img_url || './default_avatar.png'}
            alt='Your Profile'
            className={`${sizes[size]} rounded-full object-cover border-2 border-gray-200`}
            onError={(e) => {
              e.target.src = './default_avatar.png'
            }}
          />
        </div>
      </Link>
    ) : (
      <div>
        <img
          src={img_url || './default_avatar.png'}
          alt='Your Profile'
          className={`${sizes[size]} rounded-full object-cover border-2 border-gray-200 bg-bg-primary`}
          onError={(e) => {
            e.target.src = './default_avatar.png'
          }}
        />
      </div>
    )
  )
}
