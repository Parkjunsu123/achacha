import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// 모든 이미지에 대한 표준 크기 설정
const standardImageSize = { width: width * 0.7, height: width * 0.7 };
// 특별히 큰 이미지 크기 설정
const largeImageSize = { width: width * 0.85, height: width * 0.85 };

export const guideSteps = [
  // Step 1: 초기 화면
  {
    title: '아차차!',
    subText1: '또 기프티콘 유효기간을',
    subText2: '놓치셨다구요?',
    image: require('../assets/images/giftbox.png'),
    imageStyle: largeImageSize,
  },
  // Step 2: 이미지 업로드
  {
    title: '이미지 업로드만으로\n똑똑하게',
    subText1: '브랜드, 상품명, 유효기간까지',
    image: require('../assets/images/giftscan.png'),
    imageStyle: standardImageSize,
  },
  // Step 3: 유효기간 알림
  {
    title: '유효기간 임박?',
    subText1: '걱정 마세요.',
    subText2: '저희가 알려드릴게요!',
    image: require('../assets/images/bell.png'),
    imageStyle: standardImageSize,
  },
  // Step 4: 기프티콘 전달
  {
    title: '쓱- 하고 뿌리면,',
    subText1: '선물의 행운이',
    subText2: '누군가에게로.',
    image: require('../assets/images/gesture.png'),
    imageStyle: largeImageSize,
  },
  // Step 5: 쉐어박스
  {
    title: '연인도, 가족도, 친구도',
    subText1: '모두 함께 쓰는 쉐어박스',
    image: require('../assets/images/share.png'),
    imageStyle: standardImageSize,
  },
];
