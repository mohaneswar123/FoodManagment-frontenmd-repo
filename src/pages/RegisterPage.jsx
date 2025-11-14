import React, { useState } from 'react';
import { registerUser } from '../api/productApi';
import Input from '../components/Input';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			setErrorMessage('Passwords do not match.');
			return;
		}
		try {
			await registerUser({ username, email, password });
			setErrorMessage('');
			alert('Registration successful!');
			navigate('/scan'); // Navigate to BarcodeScanPage after successful registration
		} catch (error) {
			console.error('Error registering user:', error);
			setErrorMessage('Failed to register user.');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 p-2 sm:p-4">
			<div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-4 sm:p-6 border-t-2 sm:border-t-4 border-green-500">
				<div className="flex justify-center mb-3 text-2xl sm:text-4xl">🥗</div>
				<h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 text-green-600 text-center">Join Us!</h2>
				{errorMessage && <p className="text-red-600 mb-3 sm:mb-4 text-center text-sm">{errorMessage}</p>}
				<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
					<Input
						label="Username"
						value={username}
						onChange={setUsername}
						required
						placeholder="Choose a username"
					/>
					<Input
						label="Email"
						type="email"
						value={email}
						onChange={setEmail}
						required
						placeholder="Enter your email address"
					/>
					<Input
						label="Password"
						type="password"
						value={password}
						onChange={setPassword}
						required
						placeholder="Create a password"
					/>
					<Input
						label="Confirm Password"
						type="password"
						value={confirmPassword}
						onChange={setConfirmPassword}
						required
						placeholder="Confirm your password"
					/>
					<Button type="submit" variant="success" size="large" className="w-full">
						<span>Register</span> 
						<span>🥑</span>
					</Button>
				</form>
				<div className="mt-4 sm:mt-6 text-center text-green-700 font-medium text-sm sm:text-base">
					<p>Start your food management journey today!</p>
				</div>
			</div>
		</div>
	);
};

export default RegisterPage;
