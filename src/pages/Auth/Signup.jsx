import React, { useState } from 'react';

import Input from '../../components/Form/Input/Input';
import Button from '../../components/Button/Button';
import { required, length, email as emailValidator } from '../../util/validators';
import Auth from './Auth';

const Signup = props => {
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
  const [name, setName] = useState({
    value: '',
    valid: false,
    touched: false
  });
  const [formIsValid, setFormIsValid] = useState(false);

  const validateField = (input, value) => {
    if (input === 'email') {
      return [required, emailValidator].every(validator => validator(value));
    }
    if (input === 'password') {
      return [required, length({ min: 5 })].every(validator => validator(value));
    }
    return required(value);
  };

  const inputChangeHandler = (input, value) => {
    const isValid = validateField(input, value);

    if (input === 'email') {
      setEmail(prevState => ({ ...prevState, value, valid: isValid }));
    } else if (input === 'password') {
      setPassword(prevState => ({ ...prevState, value, valid: isValid }));
    } else if (input === 'name') {
      setName(prevState => ({ ...prevState, value, valid: isValid }));
    }

    const nextFormIsValid =
      (input === 'email' ? isValid : email.valid) &&
      (input === 'password' ? isValid : password.valid) &&
      (input === 'name' ? isValid : name.valid);

    setFormIsValid(nextFormIsValid);
  };

  const inputBlurHandler = input => {
    if (input === 'email') {
      setEmail(prevState => ({ ...prevState, touched: true }));
    } else if (input === 'password') {
      setPassword(prevState => ({ ...prevState, touched: true }));
    } else if (input === 'name') {
      setName(prevState => ({ ...prevState, touched: true }));
    }
  };

  const submitHandler = event => {
    const authData = {
      signupForm: {
        email: {
          value: email.value,
          valid: email.valid,
          touched: email.touched,
          validators: [required, email]
        },
        password: {
          value: password.value,
          valid: password.valid,
          touched: password.touched,
          validators: [required, length({ min: 5 })]
        },
        name: {
          value: name.value,
          valid: name.valid,
          touched: name.touched,
          validators: [required]
        },
        formIsValid
      }
    };

    props.onSignup(event, authData);
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
          id="name"
          label="Your Name"
          type="text"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler('name')}
          value={name.value}
          valid={name.valid}
          touched={name.touched}
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
          Signup
        </Button>
      </form>
    </Auth>
  );
};

export default Signup;
