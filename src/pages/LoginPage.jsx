import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/productApi';
import Input from '../components/Input';
import Button from '../components/Button';

const LoginPage = ({ setUserId }) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const user = await loginUser(username, password);
			setUserId(user.id); // Store user ID for fetching products
			setErrorMessage('');
			navigate('/scan'); // Navigate to BarcodeScanPage after login
		} catch (error) {
			console.error('Error logging in:', error);
			setErrorMessage('Invalid username or password.');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-2 sm:p-4">
			<div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-4 sm:p-6 border-t-2 sm:border-t-4 border-orange-500">
				<div className="flex justify-center mb-3 text-2xl sm:text-4xl">🍊</div>
				<h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 text-orange-600 text-center">Welcome Back!</h2>
				{errorMessage && <p className="text-red-600 mb-3 sm:mb-4 text-center text-sm">{errorMessage}</p>}
				<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
					<Input
						label="Username"
						value={username}
						onChange={setUsername}
						required
						placeholder="Enter your username"
					/>
					<Input
						label="Password"
						type="password"
						value={password}
						onChange={setPassword}
						required
						placeholder="Enter your password"
					/>
					<Button type="submit" variant="secondary" size="large" className="w-full">
						<span>Login</span> 
						<span>🚀</span>
					</Button>
				</form>
				<div className="mt-4 sm:mt-6 text-center text-amber-700 font-medium text-sm sm:text-base">
					<p>Fresh food management starts here!</p>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
