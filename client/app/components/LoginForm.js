import {capitalize, get} from 'lodash';
import React, {Component} from 'react';
import {withApollo} from '@apollo/client/react/hoc';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {ToastContainer, toast} from 'react-toastify';
import * as yup from 'yup';
import {Formik} from 'formik';
import classnames from 'classnames';

import {setCurrentUser} from '../utils/auth';
import {userLogin, userSignup} from '../graphql/user';

const {Control, Group} = Form;
const loginValidationSchema = yup.object().shape({
    email: yup.string()
        .email('*Must be a valid email address')
        .max(50, '*Email must be less than 50 characters')
        .required('*Email is required'),
    isSignup: yup.boolean(),
    password: yup.string()
        .min(6, '*Password must have at least 6 characters')
        .max(25, "*Password can't be longer than 25 characters")
        .required('*Password is required'),
    repeatPassword: yup.string().oneOf(
        [yup.ref('password')],
        '*Both passwords need to be the same'
    )
});

class Login extends Component {
    render() {
        const {formType} = this.props;
        const isSignup = formType === 'signup';
        const initialValues = {
            email: '',
            isSignup,
            password: '',
            repeatPassword: ''
        };

        return (
            <>
                <h2>{capitalize(formType)}</h2>
                <Formik
                    initialValues={initialValues}
                    validationSchema={loginValidationSchema}
                    onSubmit={async(values, {setSubmitting}) => {
                        setSubmitting(true);
                        const {client, onSetUserData} = this.props;
                        const {email, password} = values;
                        const userObj = {email, password};
                        const variables = {user: userObj};

                        try {
                            let userData;

                            if (isSignup) {
                                const res = await client.mutate({
                                    mutation: userSignup,
                                    variables
                                });

                                userData = get(res, 'data.userSignup');
                            } else {
                                const res = await client.query({
                                    query: userLogin,
                                    variables,
                                    fetchPolicy: 'network-only'
                                });

                                userData = get(res, 'data.userLogin');
                            }

                            const {__typename, user, token} = userData;

                            if (__typename === 'Error') {
                                const {code, message} = userData;
                                toast.error(`${code} Error - ${message}`);
                            } else if (token) {
                                setCurrentUser(userData);
                                onSetUserData(user, token);
                            }
                        } catch(ex) {
                            toast.error('There was an error with your login information', ex);
                        }
                    }}>
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting
                    }) => (
                        <Form onSubmit={handleSubmit}>
                            <Group>
                                <Control
                                    className={
                                        classnames('mb-4 text-left', {
                                            'is-invalid': touched.email && errors.email
                                        })
                                    }
                                    size="lg"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    type="email"
                                    value={values.email}
                                    name="email"
                                    placeholder="Email Address" />
                                <Control
                                    className={
                                        classnames('mb-4 text-left', {
                                            'is-invalid': touched.password && errors.password
                                        })
                                    }
                                    size="lg"
                                    type="password"
                                    value={values.password}
                                    name="password"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    placeholder="Password" />
                                {isSignup && (
                                    <Control
                                        className={
                                            classnames('mb-4 text-left', {
                                                'is-invalid': touched.repeatPassword && errors.repeatPassword
                                            })
                                        }
                                        size="lg"
                                        type="password"
                                        value={values.repeatPassword}
                                        name="repeatPassword"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        placeholder="Password" />
                                )}
                            </Group>
                            {Object.values(errors).map(e => {
                                return (
                                    <p className="text-danger" key={e}>{e}</p>
                                );
                            })}
                            <Button
                                className="btn-block"
                                disabled={isSubmitting}
                                size="lg"
                                type="submit">
                                Login
                            </Button>
                        </Form>
                    )}
                </Formik>
                <ToastContainer />
            </>
        );
    }
}

export default withApollo(Login);
