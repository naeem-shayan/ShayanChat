import React, {useEffect, useState} from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {mvs} from '../Config/metrices';
import Colors from '../Contants/Colors';
import CustomButton from './button';
import {useIsFocused} from '@react-navigation/native';

const CustomModal = ({navigation}: any) => {
  const [showModal, setShowModal] = useState(false);
  const user = useSelector((state: any) => state.user);
  const isFocus = useIsFocused();

  useEffect(() => {
    if (
      isFocus &&
      !showModal &&
      user.userType === 'consultant' &&
      !user.isProfileComplete
    ) {
      setShowModal(true);
    }
    return () => {
      setShowModal(false);
    };
  }, [isFocus]);
  return (
    <>
      {showModal && <View style={styles.overlay} />}
      <View style={styles.centeredView}>
        <Modal animationType="slide" transparent={true} visible={showModal}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                Incomplete Profile, To use the CustomModal, please complete your
                profile first
              </Text>
              <CustomButton
                title="Complete Profile"
                onPress={() => {
                  setShowModal(!showModal);
                  navigation.navigate('Profile');
                }}
              />
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    margin: mvs(20),
    backgroundColor: 'white',
    borderRadius: mvs(20),
    padding: mvs(35),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: mvs(15),
    textAlign: 'center',
    color: Colors.textColor,
    fontFamily: 'Poppins-Regular',
  },
});

export default CustomModal;
