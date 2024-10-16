import { IconProps } from '@/types/icon'
import React from 'react'
import { colors } from '../colors'

export const Logo: React.FC<IconProps> = ({ size = "1em", color = colors.primary600 }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 197">
      <path fill={color} d="M212.31 0c-19.972 0-36.617 13.278-41.722 33.15C161.385 3.29 137.83.023 128.004.023c-9.824 0-33.37 3.267-42.59 33.12C80.307 13.29 63.66.023 43.693.023C19.192.023 0 17.538 0 39.897c0 9.888 2.443 17.782 5.395 26.344l33.267 94.076c11.139 31.2 33.832 35.859 46.366 35.859c19.662 0 34.983-10.07 42.973-27.917c7.997 17.927 23.32 28.048 42.972 28.048c12.519 0 35.189-4.667 46.385-35.982l33.45-94.396l.261-.779c.382-1.21.768-2.345 1.132-3.423c1.781-5.27 3.799-11.243 3.799-18.563C256 18.154 237.626 0 212.31 0"/>
      <text x="128" y="140" fontSize="140" fontWeight="bold" fill="white" textAnchor="middle" dominantBaseline="middle">D</text>
    </svg>
  )
}
