import { View, Text, Modal, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native'
import React from 'react'

const ConnectDroneModal = ({showConnectModal, setShowConnectModal, password, setPassword, connectError, connectLoading, handleConnect}:{showConnectModal: boolean, setShowConnectModal: (show: boolean) => void, password: string, setPassword: (password: string) => void, connectError: string, connectLoading: boolean, handleConnect: () => void}) => {
  return (
    <Modal
    visible={showConnectModal}
    transparent
    animationType="fade"
    onRequestClose={() => setShowConnectModal(false)}
>
    <View className="flex-1 bg-black/30 justify-center items-center">
        <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md">
            <Text className="text-xl font-semibold mb-2 text-center">Enter Password</Text>
            <Text className="text-gray-500 mb-4 text-center">Please enter ClearSky password to continue</Text>
            <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 mb-2 text-base"
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
            />
            {connectError ? <Text className="text-red-500 text-center mb-2">{connectError}</Text> : null}
            <View className="flex-row justify-between mt-2">
                <TouchableOpacity
                    className="bg-gray-200 rounded-xl py-3 px-6 flex-1 mr-2 items-center"
                    onPress={() => setShowConnectModal(false)}
                    disabled={connectLoading}
                >
                    <Text className="text-gray-700 text-lg font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="bg-primary rounded-xl py-3 px-6 flex-1 ml-2 items-center"
                    onPress={handleConnect}
                    disabled={connectLoading || !password.trim()}
                >
                    {connectLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-lg font-semibold">Connect</Text>}
                </TouchableOpacity>
            </View>
        </View>
    </View>
</Modal>
  )
}

export default ConnectDroneModal