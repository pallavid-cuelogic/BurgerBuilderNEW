import React, { Component } from 'react';
import Input from '../../components/UI/Input/Input';
import Button from '../../components/UI/Button/Button';
import classes from './Auth.css';
import * as actions from '../../store/actions/index';
import { connect } from 'react-redux';
import Spinner from '../../components/UI/Spinner/Spinner';
import { Redirect } from 'react-router-dom';
import { updateObject, checkValidity } from '../../shared/utility';
import passwordValidator from 'password-validator';

class Auth extends Component {
    state = {
        controls: {
            email: {
                elementType: 'input',
                elementConfig: {
                    type: 'email',
                    placeholder: 'Mail Address'
                },
                value: '',
                validation: {
                    required: true,
                    isEmail: true
                },
                valid: false,
                touched: false
            },
            password: {
                elementType: 'input',
                elementConfig: {
                    type: 'password',
                    placeholder: 'Password'
                },
                value: '',
                valid: false,
                touched: false
            }
        },
        isSignup: true,
        passwordChecker : false,
        submitButton: true,
        errorMessage: "",
        authRedirect : null
    }

    componentDidMount() {
        if (!this.props.buildingBurger && this.props.authRedirectPath !== '/') {
            this.props.onSetAuthRedirectPath();
        }
    }

    inputChangedHandler = (event, controlName) => {
        const updatedControls = updateObject(this.state.controls, {
            [controlName]: updateObject(this.state.controls[controlName], {
                value: event.target.value,
                valid: checkValidity(event.target.value, this.state.controls[controlName].validation),
                touched: true
            })
        });
        this.setState({ controls: updatedControls });

        if(this.state.controls.email.valid) {
            if(this.state.controls.password.valid && this.state.controls.password.value.length >= 7 ) {
                this.setState({
                    submitButton:false
                });
            }
            else {
                this.setState({
                    submitButton:true
                });
            }
        }
        else {
            this.setState({
                submitButton:true
            });
        }        
    }

    submitHandler = (event) => {
        event.preventDefault();
    

        const schema = new passwordValidator();
        schema
            .is().min(8)                                    
            .is().max(100)                                  
            .has().uppercase()                              
            .has().lowercase()                              
            .has().digits()  
            .has().not().spaces()               
            
            console.log(schema.validate(this.state.controls.password.value));


            if(this.state.isSignup) {
                if(schema.validate(this.state.controls.password.value)) {
                    this.props.onAuth(this.state.controls.email.value, this.state.controls.password.value, this.state.isSignup);
                }
                else {
                    let errorMessage = <p> Password should be of minimum 8 characters, should contain atleast 1 uppercase letter, 1 lowercase letter</p>
                    this.setState({
                    errorMessage : errorMessage,
                    });
                }
            }
            else {
                this.props.onAuth(this.state.controls.email.value, this.state.controls.password.value, this.state.isSignup);

            }
    }

    switchAuthModeHandler = () => {
        localStorage.setItem('isSignUp', this.state.isSignup);
        this.setState(prevState => {
            return { isSignup: !prevState.isSignup };
        })
        localStorage.setItem('isSignUp', this.state.isSignup);
    }

    render() {
        const formElementsArray = [];
        let authRedirect = null;

        for (let key in this.state.controls) {
            formElementsArray.push({
                id: key,
                config: this.state.controls[key]
            });
        }
        let errorMessage = null
        if (this.props.error !== null) {
            errorMessage = `${this.props.error.message}`;
        }

        let form = formElementsArray.map(formElement => (
            <Input
                key={formElement.id}
                elementType={formElement.config.elementType}
                elementConfig={formElement.config.elementConfig}
                value={formElement.config.value}
                invalid={!formElement.config.valid}
                shouldValidate={formElement.config.validation}
                touched={formElement.config.touched}
                changed={(event) => this.inputChangedHandler(event, formElement.id)}
            />
        ));

        if (this.props.loading) {
            form = <Spinner />
        }

        if (this.props.isAuthenticated) {
            authRedirect = <Redirect to={this.props.authRedirectPath} />
        }

        return (
            <div className={classes.Auth}>
                {authRedirect}
               {this.setState.authRedirect}
                {this.state.errorMessage}
                {errorMessage}
                <form onSubmit={this.submitHandler}>
                    {form}
                    <Button btnType="Success" disabled ={this.state.submitButton} >SUBMIT</Button>
                </form>
                <Button
                    clicked={this.switchAuthModeHandler}
                    btnType="Danger">SWITCH TO {this.state.isSignup ? `SIGNIN` : `SIGNUP`} </Button>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        loading: state.auth.loading,
        error: state.auth.error,
        isAuthenticated: state.auth.token !== null,
        buildingBurger: state.burgerBuilder.building,
        authRedirectPath: state.auth.authRedirectPath
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onAuth: (email, password, isSignup) => dispatch(actions.auth(email, password, isSignup)),
        onSetAuthRedirectPath: () => dispatch(actions.setAuthRedirectPath('/'))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth);