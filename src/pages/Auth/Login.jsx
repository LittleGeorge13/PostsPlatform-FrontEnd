import React, { useEffect, useState } from 'react';

import Input from '../../components/Form/Input/Input';
import Button from '../../components/Button/Button';
import { required, length, email as emailValidator } from '../../util/validators';
import Auth from './Auth';

const Login = props => {
  const [email, setEmail] = useState({
    value: '',
    valid: false,
    touched: false
  });
  const [password, setPassword] = useState({
    value: '',
    valid: false,
    touched: false
  });
  const [formIsValid, setFormIsValid] = useState(false);

  useEffect(() => {
    setFormIsValid(email.valid && password.valid);
  }, [email, password]);

  const validateField = (input, value) => {
    if (input === 'email') {
      return [required, emailValidator].every(validator => validator(value));
    }
    return [required, length({ min: 5 })].every(validator => validator(value));
  };

  const inputChangeHandler = (input, value) => {
    const isValid = validateField(input, value);

    if (input === 'email') {
      setEmail(prevState => ({ ...prevState, value, valid: isValid }));
    } else if (input === 'password') {
      setPassword(prevState => ({ ...prevState, value, valid: isValid }));
    }
  };

  const inputBlurHandler = input => {
    if (input === 'email') {
      setEmail(prevState => ({ ...prevState, touched: true }));
    } else if (input === 'password') {
      setPassword(prevState => ({ ...prevState, touched: true }));
    }
  };

  const submitHandler = event => {
    props.onLogin(event, {
      email: email.value,
      password: password.value
    });
  };

  return (
    <Auth>
      <form onSubmit={submitHandler}>
        <Input
          id="email"
          label="Your E-Mail"
          type="email"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler('email')}
          value={email.value}
          valid={email.valid}
          touched={email.touched}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler('password')}
          value={password.value}
          valid={password.valid}
          touched={password.touched}
        />
        <Button design="raised" type="submit" loading={props.loading}>
          Login
        </Button>
      </form>
    </Auth>
  );
};

export default Login;
