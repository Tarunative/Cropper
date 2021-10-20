import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ImageBackground, Alert, TouchableOpacity } from 'react-native';
import Video from 'react-native-video';
import Draggable from 'react-native-draggable';
import { VideoPlayer, ProcessingManager } from 'react-native-video-processing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/urls';
import axios from 'axios';
import Loader from './Loader';
import { images } from '../../constants/images';
import * as Styles from '../../styles/Index';
import { StatusBar } from 'react-native';


const CropScreenOne = ({ navigation, route }) => {
  const { height, width } = Dimensions.get('window');

  const { uriVideo, videoHeight, videoWidth, challangeID, challangeUserID, category_id, videoID,uploadedBy } = route.params;
  console.log('Check video', videoWidth)
  const [state, setState] = useState({
    cordY: '',
    uri: '',
    video_id: 0,
    visible: false
  });





  const cropOptions = () => {
    setState(prev => ({ ...prev, visible: true }));
    const aspectRatio = 1 / 1;
    const outputWidth = videoWidth;
    const outputHeight = parseInt(outputWidth * aspectRatio);
    const options = {   
      quality: VideoPlayer.Constants.quality.QUALITY_1280x720,
      cropWidth: videoWidth,
      cropHeight: outputHeight,
      cropOffsetX: 0,
      cropOffsetY: videoHeight > height ? parseInt((videoHeight / height)  state.cordY) : parseInt((videoHeight / height)  state.cordY),
    };
    ProcessingManager.crop(uriVideo, options)
      .then(data => {
        console.log('success', data);

        if(uploadedBy==0){
          state.uri = uriVideo;
        }else{
        state.uri = data;
        }
        addVideo()

      })
      .catch(error => {
        state.uri = uriVideo;
        addVideo()
      });
  };


  const createFormData = (body) => {
    const data = new FormData();
    if (state.uri !== null) {
      data.append('video', {
        name: 'name.mp4',
        uri: state.uri,
        type: 'video/mp4'

      });
    }
    data.append('Content-Type', 'video/mp4');
    Object.keys(body).forEach(key => {
      data.append(key, body[key]);
    });
    return data;
  };

  // Add Video
  const addVideo = async () => {

    const token = await AsyncStorage.getItem('token');
    const headers = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    const params = {
      video_uploaded_via: 'Gallery',
    };

    console.log('#. addVideo params : ', params);
    const formData = createFormData(params);
    await axios
      .post(BASE_URL + 'add/video', formData, headers, {
        timeout: 3000,
      })
      .then(async response => {
        console.log('#. addVideo() : ', response.data.data);
        if (response.data.status === 200) {
          // setState(prev => ({ ...prev, visible: false }));
          state.video_id = response.data.data.video.id;
          challangeVideoAPI()

        } else {
          setState(prev => ({ ...prev, visible: false }));
          Alert.alert('Or', ' ' + response.data.message);
        }
      })
      .catch(error => {
        setState(prev => ({ ...prev, visible: false }));
        console.log(
          '#. addVideo() error : ',
          error.response.data.message,
        );
        Alert.alert('Or', ' ' + error.response.data.message);
      });
  };

  const challangeVideoAPI = async () => {
    const token = await AsyncStorage.getItem('token');
    const headers = {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    const params = {
      video_id: state.video_id,
      challenge_id: challangeID,
      category_id: category_id,
      challenge_users: [challangeUserID],
      flag: 2,
      primary_video_id: videoID

    };
    console.log('#. ChallangeAPI()11 : ', params);
    await axios
      .post(BASE_URL + 'challenge/user', params, headers, {
        timeout: 3000,
      })
      .then(async response => {
        console.log('#. ChallangeAPI()11 : ', response);
        if (response.data.status === 200) {

          navigation.reset({
            index: 1,
            routes: [{ name: 'Authenticator' }],
          })
          setState(prev => ({ ...prev, visible: false }));
        } else {
          setState(prev => ({ ...prev, visible: false }));
        }
      })
      .catch(error => {
        setState(prev => ({ ...prev, visible: false }));
        console.log(
          '#. forgetPasswordAPI() error : ',
          error.response.data.message,
        );
        Alert.alert('Or', ' ' + error.response.data.message);
      });
  };


  return (
    <ImageBackground
      source={images.backgroundImg}
      style={Styles.ImageStyles.backgroungImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      {state.visible ? <Loader /> : (

        <View style={{ flex: 1 }} >
           {uploadedBy == 1 ?
            <Video
              source={{ uri: uriVideo }}
              resizeMode='contain'

              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#000000',
                opacity: 0.9,

                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center'


              }}
            />
            : <Video
              source={{ uri: uriVideo }}
              resizeMode='cover'
              style={{
                width: width,
                height: width,
                backgroundColor: '#000000',
                marginTop:
                (height + StatusBar.currentHeight)/2-width/2,
                alignSelf: 'center'
              }}
            />}

          <View style={{ flex: 1, position: 'absolute', justifyContent: 'center' }}>

            <Draggable
              minX={5}
              minY={65}
              maxX={width - 5}
              maxY={height + StatusBar.currentHeight - 65}
              x={5}
              y={(height + StatusBar.currentHeight)/2-width/2}
              onDragRelease={e => {
                let diff = e.nativeEvent.pageY - e.nativeEvent.locationY;
                if (diff === 0 && e.nativeEvent.locationY >= 0) {
                  setState({
                    cordY: height / 2,
                  });
                } else if (diff === 0 && e.nativeEvent.locationY <= 0) {
                  setState({
                    cordY: 0,
                  });
                } else {
                  if(height>750){
                    setState({
                      cordY: diff-65,
                    });
                  }else{
                    setState({
                      cordY: diff,
                    });
                  }
                
                }

                console.log(
                  'pageX, pageY = ' +
                  e.nativeEvent.pageX +
                  ', ' +
                  e.nativeEvent.pageY,
                );
                console.log(
                  'locX, locY = ' +
                  e.nativeEvent.locationX +
                  ', ' +
                  e.nativeEvent.locationY,
                );
                console.log('X', e.nativeEvent.pageX - e.nativeEvent.locationX);
                console.log('Y', e.nativeEvent.pageY - e.nativeEvent.locationY);
              }}>
              <View
                onLayout={event => {
                  const layout = event.nativeEvent.layout;
                  console.log('layoutx, layouty = ' + layout.x + ', ' + layout.y);

                }}
                style={{
                  width: width - 10,
                  height: width,
                  borderWidth: 5,
                  borderColor: 'white',
                  borderRadius: 10,
                }}
              />
            </Draggable>








          </View>

          <TouchableOpacity
           onPress={() =>
            cropOptions()
          }
            style={{
              justifyContent:'center',
               width: 80, height: 30, position: 'absolute',
              bottom: 25, end: 20, backgroundColor: 'red', borderRadius: 10
            }}>
          <Text
           
            style={{
              textAlign: 'center', alignSelf: 'center', color: 'white'
              
            }}>
            Crop
          </Text>
          </TouchableOpacity>
         
           
        </View>

      )}
    </ImageBackground>
  );
};

export default CropScreenOne;
