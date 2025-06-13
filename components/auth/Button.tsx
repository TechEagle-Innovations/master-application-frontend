import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'

const Button = ({ loading, actionFunction, buttonText, buttonTextLoading }: { loading: boolean, actionFunction: () => void, buttonText: string, buttonTextLoading: string }) => {
    return (
        <TouchableOpacity
            className={`w-full rounded-lg py-4 ${loading ? 'bg-primary opacity-80' : 'bg-primary'}`}
            onPress={actionFunction}
            disabled={loading}
            activeOpacity={0.8}
        >
            <Text className="text-white text-center text-base font-semibold">
                {loading ? buttonTextLoading : buttonText}
            </Text>
        </TouchableOpacity>
    )
}

export default Button;