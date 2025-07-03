import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, ProgressBar } from 'react-bootstrap';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import UAParser from 'ua-parser-js';
import './App.css'; // Custom CSS for styling and layout

// Google Maps container style
const mapContainerStyle = {
  height: '300px',
  width: '100%',
  marginBottom: '20px',
};

// Password strength checker function
const checkPasswordStrength = (password) => {
  if (password.length < 6) return { score: 0, label: 'Weak', variant: 'danger' };
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  if (strength >= 4) return { score: 100, label: 'Strong', variant: 'success' };
  if (strength >= 2) return { score: 60, label: 'Medium', variant: 'warning' };
  return { score: 30, label: 'Weak', variant: 'danger' };
};

function App() {
  // State for form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    password: '',
    confirmPassword: '',
    latitude: '',
    longitude: '',
    deviceInfo: {},
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [locationError, setLocationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addressCharCount, setAddressCharCount] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', variant: '' });
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });

  // Capture browser/device info on component mount
  useEffect(() => {
    const parser = new UAParser();
    const result = parser.getResult();
    setFormData((prevData) => ({
      ...prevData,
      deviceInfo: {
        browser: result.browser.name,
        browserVersion: result.browser.version,
        os: result.os.name,
        osVersion: result.os.version,
        device: result.device.model || 'Unknown',
      },
    }));
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    setSuccessMessage('');

    // Update address character count
    if (name === 'address') {
      setAddressCharCount(value.length);
    }

    // Update password strength
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  // Fetch customer data by phone number for auto-fill
  const handlePhoneBlur = async () => {
    if (formData.phoneNumber.length === 10) {
      try {
        const response = await axios.get(`https://registrationform-o0w1.onrender.com/api/customers/phone/${formData.phoneNumber}`);
        const customer = response.data;
        setFormData((prevData) => ({
          ...prevData,
          fullName: customer.fullName || '',
          email: customer.email || '',
          gender: customer.gender || '',
          dateOfBirth: customer.dateOfBirth || '',
          address: customer.address || '',
          latitude: customer.latitude || '',
          longitude: customer.longitude || '',
        }));
        setAddressCharCount(customer.address?.length || 0);
        setMapCenter({
          lat: parseFloat(customer.latitude) || 0,
          lng: parseFloat(customer.longitude) || 0,
        });
        setSuccessMessage('Customer data auto-filled!');
      } catch (error) {
        if (error.response?.status === 404) {
          setSuccessMessage('New customer, please fill all details.');
        } else {
          setErrors({ server: 'Failed to fetch customer data.' });
        }
      }
    }
  };

  // Get user location using Geolocation API
  const getLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          setFormData((prevData) => ({
            ...prevData,
            latitude: lat,
            longitude: lng,
          }));
          setMapCenter({ lat: parseFloat(lat), lng: parseFloat(lng) });
          setLocationError('');
          setIsLoading(false);
        },
        (error) => {
          setLocationError('Unable to fetch location. Please allow location access.');
          setIsLoading(false);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone Number is required';
    else if (!/^\d{10}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Phone Number must be 10 digits';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    else if (formData.address.length > 200) newErrors.address = 'Address must be less than 200 characters';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.latitude || !formData.longitude) newErrors.location = 'Location is required. Click Get Location.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrors({});
    if (validateForm()) {
      setIsLoading(true);
      try {
        console.log('Submitting form data:', formData); // Debug log
        const response = await axios.post('https://registrationform-o0w1.onrender.com/api/customers', formData);
        setSuccessMessage(response.data.message);
        setFormData({
          fullName: '',
          email: '',
          phoneNumber: '',
          gender: '',
          dateOfBirth: '',
          address: '',
          password: '',
          confirmPassword: '',
          latitude: '',
          longitude: '',
          deviceInfo: formData.deviceInfo,
        });
        setAddressCharCount(0);
        setPasswordStrength({ score: 0, label: '', variant: '' });
        setMapCenter({ lat: 0, lng: 0 });

        // Show SweetAlert on success
        if (window.Swal) {
          window.Swal.fire({
            position: 'top-end',
            icon: 'sweetalert2',
            title: 'Registration Successful!',
            text: response.data.message,
            showConfirmButton: false,
            timer: 3000,
            toast: true,
          });
        }
      } catch (error) {
        setErrors({ server: error.response?.data?.error || 'Failed to submit. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Container fluid className="form-wrapper" style={{ background: 'purple' }}>
      <Row className="align-items-center min-vh-100 justify-content-center">
        <Col md={8} className="p-4">
          <div className="form-container">
            {/* YouTube Iframe */}
            <div className="youtube-iframe">
              <iframe
                width="200"
                height="200"
                src="https://www.youtube.com/embed/vp4O5W1gTjA"
                title="YouTube video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Floating className="mb-3">
                    <Form.Control
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      isInvalid={!!errors.fullName}
                      placeholder="Full Name"
                      className="custom-input"
                    />
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control.Feedback type="invalid">{errors.fullName}</Form.Control.Feedback>
                  </Form.Floating>
                </Col>
                <Col md={6}>
                  <Form.Floating className="mb-3">
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      isInvalid={!!errors.email}
                      placeholder="Email Address"
                      className="custom-input"
                    />
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                  </Form.Floating>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Floating className="mb-3">
                    <Form.Control
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      onBlur={handlePhoneBlur}
                      isInvalid={!!errors.phoneNumber}
                      placeholder="Phone Number"
                      className="custom-input"
                    />
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control.Feedback type="invalid">{errors.phoneNumber}</Form.Control.Feedback>
                  </Form.Floating>
                </Col>
                <Col md={6}>
                  <Form.Floating className="mb-3">
                    <Form.Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      isInvalid={!!errors.gender}
                      placeholder="Gender"
                      className="custom-input"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                    <Form.Label>Gender</Form.Label>
                    <Form.Control.Feedback type="invalid">{errors.gender}</Form.Control.Feedback>
                  </Form.Floating>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Floating className="mb-3">
                    <Form.Control
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      isInvalid={!!errors.dateOfBirth}
                      placeholder="Date of Birth"
                      className="custom-input"
                    />
                    <Form.Label>Date of Birth</Form.Label>
                    <Form.Control.Feedback type="invalid">{errors.dateOfBirth}</Form.Control.Feedback>
                  </Form.Floating>
                </Col>
                <Col md={6}>
                  <Form.Floating className="mb-3">
                    <Form.Control
                      as="textarea"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      isInvalid={!!errors.address}
                      placeholder="Address"
                      rows={3}
                      maxLength={200}
                      className="custom-input"
                    />
                    <Form.Label>Address</Form.Label>
                    <Form.Text className="char-count">{addressCharCount}/200 characters</Form.Text>
                    <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                  </Form.Floating>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Floating className="mb-3">
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                      placeholder="Password"
                      className="custom-input"
                    />
                    <Form.Label>Password</Form.Label>
                    {formData.password && (
                      <div className="mt-2">
                        <ProgressBar
                          now={passwordStrength.score}
                          label={passwordStrength.label}
                          variant={passwordStrength.variant}
                        />
                      </div>
                    )}
                    <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                  </Form.Floating>
                </Col>
                <Col md={6}>
                  <Form.Floating className="mb-3">
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      isInvalid={!!errors.confirmPassword}
                      placeholder="Confirm Password"
                      className="custom-input"
                    />
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
                  </Form.Floating>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Floating className="mb-3">
                    <Form.Control
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      readOnly
                      isInvalid={!!errors.location}
                      placeholder="Latitude"
                      className="custom-input"
                    />
                    <Form.Label>Latitude</Form.Label>
                  </Form.Floating>
                </Col>
                <Col md={6}>
                  <Form.Floating className="mb-3">
                    <Form.Control
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      readOnly
                      isInvalid={!!errors.location}
                      placeholder="Longitude"
                      className="custom-input"
                    />
                    <Form.Label>Longitude</Form.Label>
                    <Form.Control.Feedback type="invalid">{errors.location}</Form.Control.Feedback>
                  </Form.Floating>
                </Col>
              </Row>
              {/* Google Maps Preview */}
              {formData.latitude && formData.longitude && (
                <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={15}
                  >
                    <Marker position={mapCenter} />
                  </GoogleMap>
                </LoadScript>
              )}
              <Button
                variant="outline-secondary"
                onClick={getLocation}
                disabled={isLoading}
                className="mb-3 custom-btn"
              >
                {isLoading ? 'Fetching Location...' : 'Get Location'}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="mb-3 custom-btn ms-2"
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
