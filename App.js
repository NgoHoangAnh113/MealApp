import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, TextInput, Switch } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme } from 'react-native';
import Swiper from 'react-native-swiper';
import * as SplashScreen from 'expo-splash-screen'; // Thay thế AppLoading
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync(); // Bắt đầu chặn màn hình splash

const Stack = createStackNavigator();

// Dữ liệu mẫu cho các danh mục món ăn
const categories = [
  { id: '1', title: 'Italian', image: require('./assets/italian.png') },
  { id: '2', title: 'Asian', image: require('./assets/asian.png') },
];

// Dữ liệu mẫu cho các món ăn
const meals = {
  '1': [
    { id: '1', title: 'Spaghetti Bolognese' },
    { id: '2', title: 'Lasagna' },
  ],
  '2': [
    { id: '3', title: 'Sushi' },
    { id: '4', title: 'Pho' },
  ],
};

// Màn hình hiển thị danh sách danh mục món ăn với thanh tìm kiếm và dark mode
const CategoriesScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.gridItem} 
      onPress={() => navigation.navigate('Meals', { categoryId: item.id })}
    >
      <LinearGradient colors={['#ff6f00', '#ff8c00']} style={styles.container}>
        <Image source={item.image} style={styles.image} />
        <Text style={isDarkMode ? styles.titleDark : styles.title}>{item.title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={isDarkMode ? styles.screenDark : styles.screen}>
      <TextInput 
        style={styles.searchBar} 
        placeholder="Search categories..." 
        onChangeText={setSearchTerm}
      />
      <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
      <FlatList
        data={filteredCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
      />
    </View>
  );
};

// Màn hình hiển thị danh sách món ăn
const MealsScreen = ({ route }) => {
  const { categoryId } = route.params;
  const displayedMeals = meals[categoryId] || [];
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const storedFavorites = await AsyncStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  };

  const toggleFavorite = async (mealId) => {
    let updatedFavorites = [...favorites];
    if (favorites.includes(mealId)) {
      updatedFavorites = updatedFavorites.filter(id => id !== mealId);
    } else {
      updatedFavorites.push(mealId);
    }
    setFavorites(updatedFavorites);
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const renderMealItem = ({ item }) => (
    <View style={styles.mealItem}>
      <Text style={styles.text}>{item.title}</Text>
      <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
        <Icon name={favorites.includes(item.id) ? 'heart' : 'heart-outline'} size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={displayedMeals}
        keyExtractor={(item) => item.id}
        renderItem={renderMealItem}
      />
    </View>
  );
};

// Màn hình giới thiệu (Onboarding)
const OnboardingScreen = ({ navigation }) => {
  return (
    <Swiper loop={false}>
      <View style={styles.slide}>
        <Text>Chào mừng đến nhà hàng Hoàng Anh!</Text>
      </View>
      <View style={styles.slide}>
        <Text>MSSV 2024801030067</Text>
      </View>
      <View style={styles.slide}>
        <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
          <Text>Bắt đầu</Text>
        </TouchableOpacity>
      </View>
    </Swiper>
  );
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        setAppIsReady(true);
      } catch (e) {
        console.warn(e);
      } finally {
        if (appIsReady) {
          await SplashScreen.hideAsync();
        }
      }
    }

    prepare();
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding">
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Categories" component={CategoriesScreen} />
        <Stack.Screen name="Meals" component={MealsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ecf0f1',
  },
  screenDark: {
    flex: 1,
    padding: 20,
    backgroundColor: '#2c3e50',
  },
  gridItem: {
    flex: 1,
    margin: 15,
    height: 150,
    borderRadius: 10,
    elevation: 5,
  },
  container: {
    flex: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '70%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    color: '#333',
  },
  titleDark: {
    fontSize: 20,
    textAlign: 'center',
    color: '#fff',
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
  },
});
