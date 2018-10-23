
import React from 'react';
import {
 Marker,
 InfoWindow,
} from 'react-google-maps';
import blueMarkerUrl from '../assets/images/blue-marker.svg';

export class AroundMarker extends React.Component {
 state = {
   isOpen: false,
 }

 onToggleOpen = () => {
   this.setState((prevState) => {
     return {
       isOpen: !prevState.isOpen,
     }
   });
 }

 render() {
   const { location, url, user, message, type } = this.props.post;
   const isImagePost = type === 'image';
   const icon = isImagePost ? undefined : {
     url: blueMarkerUrl,
     scaledSize: new window.google.maps.Size(26, 41),
   }
   return (
     <Marker
       position={{ lat: location.lat, lng: location.lon }}
       onMouseOver={isImagePost? this.onToggleOpen : undefined}
       onMouseOut={isImagePost? this.onToggleOpen : undefined}
       onClick={isImagePost ? undefined : this.onToggleOpen}
       icon={icon}
     >
       {this.state.isOpen ? (<InfoWindow onCloseClick={this.onToggleOpen}>
         <div>
           {
             isImagePost ?
               <img src={url} alt={message} className="around-marker-image"/>
               :
               <video src={url} className="around-marker-video" controls/>
           }
           <p>{`${user}: ${message}`}</p>
         </div>
       </InfoWindow>) : null}
     </Marker>
   );
 }
}

import React from 'react';
import $ from 'jquery';
import { Modal, Button, message } from 'antd';
import { WrappedCreatePostForm } from './CreatePostForm';
import { API_ROOT, AUTH_PREFIX, TOKEN_KEY, POS_KEY, LOC_SHAKE } from '../constants';

export class CreatePostButton extends React.Component {
 state = {
   ModalText: 'Content of the modal',
   visible: false,
   confirmLoading: false,
 }

 showModal = () => {
   this.setState({
     visible: true,
   });
 }

 handleOk = () => {
   // collect values
   this.form.validateFields((err, values) => {
     if(!err) {
       // send request
       const { lat, lon } = JSON.parse(localStorage.getItem(POS_KEY));
       const formData = new FormData();
       formData.set('lat', lat + Math.random() * LOC_SHAKE * 2 - LOC_SHAKE);
       formData.set('lon', lon + Math.random() * LOC_SHAKE * 2 - LOC_SHAKE);
       formData.set('message', values.message);
       formData.set('image', values.image[0].originFileObj);
       this.setState({ confirmLoading: true });
       $.ajax({
         url: `${API_ROOT}/post`,
         method: 'POST',
         data: formData,
         headers: {
           Authorization: `${AUTH_PREFIX} ${localStorage.getItem(TOKEN_KEY)}`,
         },
         processData: false,
         contentType: false,
         dataType: 'text',
       }).then(() => {
         message.success('Create post succeed!');
         this.form.resetFields();
         this.setState({ visible: false, confirmLoading: false });
         this.props.loadNearbyPost();
       }, () => {
         message.error('Create post failed.');
         this.setState({ confirmLoading: false });
       }).catch((e) => {
         console.log(e);
       });
     }
   });
 }

 handleCancel = () => {
   console.log('Clicked cancel button');
   this.setState({
     visible: false,
   });
 }

 saveFormRef = (formIntance) => {
   this.form = formIntance;
 }

 render() {
   const { visible, confirmLoading } = this.state;
   return (
     <div>
       <Button type="primary" onClick={this.showModal}>Create New Post</Button>
       <Modal title="Create New Post"
              visible={visible}
              onOk={this.handleOk}
              okText="Create"
              confirmLoading={confirmLoading}
              onCancel={this.handleCancel}
       >
         <WrappedCreatePostForm ref={this.saveFormRef}/>
       </Modal>
     </div>
   );
 }
}
