import React from 'react';
import { Register } from './Register';
import { Login } from './Login';
import { Home } from './Home';
import { Switch, Route, Redirect } from 'react-router-dom';

export class Main extends React.Component {
 getHome = () => {
   return this.props.isLoggedIn ? <Home/> : <Redirect to="/login"/>;
 }

 getLogin = () => {
   return this.props.isLoggedIn ? <Redirect to="/home"/> : <Login handleLogin={this.props.handleLogin}/>;
 }

 getRoot = () => {
   return <Redirect to="/login"/>;
 }

 render() {
   return (
     <div className="main">
       <Switch>
         <Route exact path="/" render={this.getRoot}/>
         <Route path="/login" render={this.getLogin}/>
         <Route path="/register" component={Register}/>
         <Route path="/home" render={this.getHome}/>
         <Route render={this.getRoot}/>
       </Switch>
     </div>
   );
 }
}
Register.js
import React from 'react';
import { Form, Input, Button, message } from 'antd';
import $ from 'jquery';
import { Link } from 'react-router-dom';
import { API_ROOT } from '../constants';

const FormItem = Form.Item;

class RegistrationForm extends React.Component {
 state = {
   confirmDirty: false,
   autoCompleteResult: [],
 };

 handleSubmit = (e) => {
   e.preventDefault();
   this.props.form.validateFieldsAndScroll((err, values) => {
     if (!err) {
       console.log('Received values of form: ', values);
       $.ajax({
         url: `${API_ROOT}/signup`,
         method: 'POST',
         data: JSON.stringify({
           username: values.username,
           password: values.password,
         })
       }).then((response) => {
         message.success(response);
         this.props.history.push('/login');
       }, (response) => {
         message.error(response.responseText);
       }).catch((e) => {
         console.log(e);
       });
     }
   });
 }

 handleConfirmBlur = (e) => {
   const value = e.target.value;
   this.setState({ confirmDirty: this.state.confirmDirty || !!value });
 }

 compareToFirstPassword = (rule, value, callback) => {
   const form = this.props.form;
   if (value && value !== form.getFieldValue('password')) {
     callback('Two passwords that you enter is inconsistent!');
   } else {
     callback();
   }
 }

 validateToNextPassword = (rule, value, callback) => {
   const form = this.props.form;
   if (value && this.state.confirmDirty) {
     form.validateFields(['confirm'], { force: true });
   }
   callback();
 }

 render() {
   const { getFieldDecorator } = this.props.form;

   const formItemLayout = {
     labelCol: {
       xs: { span: 24 },
       sm: { span: 8 },
     },
     wrapperCol: {
       xs: { span: 24 },
       sm: { span: 16 },
     },
   };
   const tailFormItemLayout = {
     wrapperCol: {
       xs: {
         span: 24,
         offset: 0,
       },
       sm: {
         span: 16,
         offset: 8,
       },
     },
   };

   return (
     <Form onSubmit={this.handleSubmit} className="register-form">
       <FormItem
         {...formItemLayout}
         label="Username"
       >
         {getFieldDecorator('username', {
           rules: [{ required: true, message: 'Please input your username!' }],
         })(
           <Input />
         )}
       </FormItem>
       <FormItem
         {...formItemLayout}
         label="Password"
       >
         {getFieldDecorator('password', {
           rules: [{
             required: true, message: 'Please input your password!',
           }, {
             validator: this.validateToNextPassword,
           }],
         })(
           <Input type="password" />
         )}
       </FormItem>
       <FormItem
         {...formItemLayout}
         label="Confirm Password"
       >
         {getFieldDecorator('confirm', {
           rules: [{
             required: true, message: 'Please confirm your password!',
           }, {
             validator: this.compareToFirstPassword,
           }],
         })(
           <Input type="password" onBlur={this.handleConfirmBlur} />
         )}
       </FormItem>
       <FormItem {...tailFormItemLayout}>
         <Button type="primary" htmlType="submit">Register</Button>
         <p>I already have an account, go back to <Link to="/login">login</Link></p>
       </FormItem>
     </Form>
   );
 }
}

export const Register = Form.create()(RegistrationForm);