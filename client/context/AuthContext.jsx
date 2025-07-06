import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import toast from "react-hot-toast";
import { io } from 'socket.io-client'

const backendUrl = import.meta.env.VITE_BACKEND_URL
axios.defaults.baseURL = backendUrl
axios.defaults.withCredentials = true
export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(null)
    const [authUser, setAuthUser] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState([])
    const [socket, setSocket] = useState(null)

    const checkAuth = async () => {
        try {
            const { data } = await axios.get('/api/auth/check')

            if (data.success) {
                setAuthUser(data.user)
                connectSocket(data.user)
            }
        } catch (error) {
            toast.error(error.message || 'Oops Something went wrong')
        }
    }

    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials)

            if (data.success) {
                setAuthUser(data.user)
                connectSocket(data.user)
                axios.defaults.headers.common['token'] = data.token

                setToken(data.token)
                localStorage.setItem('token', data.token)
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const logout = async () => {

        try {
            const { data } = await axios.post('/api/auth/logout')

            if (data.success) {
                setAuthUser(null)
                setOnlineUsers([])
                toast.success(data.message)
                socket.disconnect()
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put('/api/auth/update-profile', body)

            if (data.success) {
                setAuthUser(data.user)
                toast.success('Profile updated successfully')
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id
            },
            withCredentials: true
        })
        newSocket.connect()
        setSocket(newSocket)

        newSocket.on('onlineUsers', (userIds) => {
            setOnlineUsers(userIds)
        })
    }

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['token'] = token
        }
        checkAuth()
    }, [])
    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}