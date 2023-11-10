import React, {useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import categoriesList from '../Catergories';
import Category from '../Components/category';
import {mvs} from '../Config/metrices';
import Colors from '../Contants/Colors';
import CustomSearch from '../Components/search';
//@ts-ignore
import _ from 'lodash';

const Categories = () => {
  const [categories, setCategories] = useState(categoriesList);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const debouncedSearch = _.debounce((value: string) => {
    setLoading(true);
    const filtered = categoriesList.filter(category =>
      category.name.toLowerCase().includes(value.toLowerCase()),
    );
    setCategories(filtered);
    setLoading(false);
  }, 500);
  const handleSearchChange = (value: string) => {
    debouncedSearch(value.trim());
  };
  return (
    <View style={styles.rootContainer}>
      <Text style={styles.title}>Categories</Text>
      <CustomSearch
        placeholder="Search Category"
        value={value}
        setValue={setValue}
        onChangeText={(text: any) => handleSearchChange(text)}
        mb={10}
      />
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.firstColor} />
        </View>
      ) : categories.length > 0 ? (
        <View style={styles.contentContainer}>
          <FlatList
            data={categories}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <View style={styles.container}>
                <Category
                  name={item.name}
                  image={item.image}
                  onPress={() => Alert.alert('clicked')}
                />
              </View>
            )}
          />
        </View>
      ) : (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>No Such Category</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: mvs(15),
  },
  container: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: Colors.firstColor,
    fontSize: mvs(25),
    marginLeft: mvs(20),
    marginVertical: mvs(20),
    fontFamily: 'Poppins-Regular',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    color: Colors.firstColor,
    fontSize: mvs(20),
    fontFamily: 'Poppins-Regular',
  },
});

export default Categories;
