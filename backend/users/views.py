from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User
from .serializers import (
    RegisterSerializer,
    LoginSerializer
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Account created successfully.',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'phone_number': user.phone_number,
                'is_staff': user.is_staff,
                'is_staff_member': user.is_staff_member,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):

    serializer = LoginSerializer(
        data=request.data
    )

    if serializer.is_valid():
        return Response(
            serializer.validated_data,
            status=status.HTTP_200_OK
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def profile_view(request):

    user = request.user

    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'phone_number': user.phone_number,
        'is_staff': user.is_staff,
        'is_staff_member': user.is_staff_member,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):

    try:
        refresh_token = request.data.get('refresh')

        token = RefreshToken(refresh_token)

        token.blacklist()

        return Response({
            'message': 'Logged out successfully.'
        })

    except TokenError:

        return Response({
            'error': 'Invalid or expired token.'
        }, status=status.HTTP_400_BAD_REQUEST)
@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def create_superuser_view(request):
    try:
        user = User.objects.create_superuser(
            username=request.data['username'],
            email=request.data['email'],
            password=request.data['password'],
            phone_number=request.data.get('phone_number', '+254000000000')
        )
        return Response({'message': 'Superuser created successfully.'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password_view(request):
    email = request.data.get('email')
    new_password = request.data.get('new_password')
    try:
        user = User.objects.get(email__iexact=email)
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password reset successfully!'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
