import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

const Profile = () => {

    const { updateProfile, authUser } = useContext(AuthContext)

    const [selectedImg, setSelectedImg] = useState(null)
    const [name, setName] = useState(authUser.fullName)
    const [bio, setBio] = useState(authUser.bio)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedImg) {
            await updateProfile({ fullName: name, bio })
            navigate('/')
            return
        }

        const reader = new FileReader()
        reader.readAsDataURL(selectedImg)
        reader.onload = async () => {
            const base64Image = reader.result
            await updateProfile({ profilePic: base64Image, fullName: name, bio })
            navigate('/')
        }
    }
    return (
        <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
            <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
                <form onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1'>
                    <h3 className='text-lg'>Profile Details</h3>
                    <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
                        <input type="file" id='avatar' accept='.png, .jpg, .jpeg' hidden onChange={e => setSelectedImg(e.target.files[0])} />
                        <img src={selectedImg ? URL.createObjectURL(selectedImg) : assets.avatar_icon} alt="" className={`size-12 ${selectedImg && 'rounded-full'} object-cover`} />
                        upload profile image
                    </label>
                    <input type="text" required placeholder='Your name' className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' onChange={e => setName(e.target.value)} value={name} />

                    <textarea required placeholder='Write profile bio' className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' rows={4} onChange={e => setBio(e.target.value)} value={bio}></textarea>
                    <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-full cursor-pointer'>Save</button>
                </form>
                <img src={authUser?.profilePic || assets.logo_icon} alt="" className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedImg && 'rounded-full'} object-cover`} />
            </div>
        </div>
    )
}

export default Profile