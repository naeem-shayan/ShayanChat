import React, {useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import categoriesList from '../Contants/catergoriesJSON';
import {mvs} from '../Config/metrices';
import Colors from '../Contants/Colors';
import CustomSearch from '../Components/search';
//@ts-ignore
import _ from 'lodash';
import CategoryCard from '../Components/category';

const Categories = ({navigation}: any) => {
  const [categories, setCategories] = useState(categoriesList);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const gotoUsersScreen = (categoryName: string) => {
    navigation.replace('Home', { screen: 'CreateChannelScreen', params: { categoryName } });
  };

  const debouncedSearch = _.debounce((value: string) => {
    setLoading(true);
    const filtered = categoriesList.filter(category =>
      category.name.toLowerCase().includes(value.toLowerCase()),
    );
    setCategories(filtered);
    setLoading(false);
  }, 500);
  const handleSearchChange = (value: string) => {
    if (value?.trim()) {
      debouncedSearch(value);
    } else {
      setCategories(categoriesList);
    }
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
                <CategoryCard
                  name={item.name}
                  image={item.image}
                  onPress={() => gotoUsersScreen(item.name)}
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
