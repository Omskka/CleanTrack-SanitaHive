import { Text } from '@gluestack-ui/themed';
import { Link } from 'expo-router';


export default function NotFoundScreen() {
  return (
    <>
      <Text>
        <Link href="/">
          This is not the page you are looking for.
        </Link>
      </Text>
    </>
  );
}


