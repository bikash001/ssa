#include <stdio.h>

int main()
{
	int a, b;
	a = 10;
	b = a *4;
	if (a < b) {
		a = 10;
	} else {
		b = 10;
	}
	while (a < b) {
		a = a+b*b;
		b = b/5;
	}
	printf("%d\n", a+b);
	return 0;
}