import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'

const Login = () => {
    const [currentState, setCurrentState] = useState('Login')
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [bio, setBio] = useState('')
    const [isDataSubmitted, setisDataSubmitted] = useState(false)

    const { login } = useContext(AuthContext)

    const onSubmitHandler = e => {
        e.preventDefault()

        if (currentState === 'Sign Up' && !isDataSubmitted) {
            setisDataSubmitted(true)
            return
        }

        login(currentState === 'Sign Up' ? 'signup' : 'login', { fullName, email, password, bio });

    }


    return (
        <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
            <img src={assets.logo_big} alt="" className='w-[min(30vw,250px)]' />

            <form onSubmit={onSubmitHandler} className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
                <h2 className='font-medium text-2xl flex justify-between items-center'>
                    {currentState}
                    {isDataSubmitted && <img src={assets.arrow_icon} alt="" className='w-5 cursor-pointer' onClick={() => setisDataSubmitted(false)} />}
                </h2>
                {currentState === 'Sign Up' && !isDataSubmitted && (
                    <input type="text" className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' placeholder='Full Name' required onChange={e => setFullName(e.target.value)} value={fullName} />
                )}
                {!isDataSubmitted && (
                    <>
                        <input type="email" placeholder='Email Address' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' onChange={e => setEmail(e.target.value)} value={email} />
                        <input type="password" onChange={e => setPassword(e.target.value)} value={password} placeholder='Password' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' />
                    </>
                )}
                {
                    currentState === 'Sign Up' && isDataSubmitted && (
                        <textarea rows={4} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' placeholder='Provide a short bio...' onChange={e => setBio(e.target.value)} value={bio}></textarea>
                    )
                }

                {currentState === 'Sign Up' && <div>
                    <input type="checkbox" />
                    <p>Agree to the terms of use & privacy policy.</p>
                </div>}

                <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
                    {currentState === 'Sign Up' ? 'Create Account' : 'Login Now'}
                </button>

                <div className='flex flex-col gap-2'>
                    {currentState === 'Sign Up' ? (
                        <p className='text-sm text-gray-500 cursor-pointer'>Already have an account? <span className='font-medium text-violet-500 cursor-pointer' onClick={() => { setCurrentState('Login'); setisDataSubmitted(false) }}>Login Here</span></p>
                    ) : (
                        <p className='text-sm text-gray-500 cursor-pointer'>Create an account <span className='font-medium text-violet-500 cursor-pointer' onClick={() => setCurrentState('Sign Up')}>Click here</span></p>
                    )}
                </div>

            </form>

        </div>
    )
}

export default Login