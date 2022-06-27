function addTocart(proId){
	// alert("========")
		$.ajax({
			url:'/add-tocart/'+proId,
			method:'get',
			success:(response)=>{
				// alert(response)
				if(response.msg){
					let count=$('#cart-count').html()
					counts=parseInt(count)+1
					$('#cart-count').html(counts)
					addcart()
			}else{
				firstlogedin()
			}
				
			}
		})
	}

	function addedTocart(proId){
		alert(proId)
			$.ajax({
				url:'/add-tocartformwishlist/'+proId,
				method:'get',
				success:(response)=>{
					// alert(response)
					if(response.msg){
						location.reload()
				
					
				}
			}
			})
		}

	

	



	function addcart() {
		Swal.fire({
			title: 'Product added to cart!',
			icon: 'success',
			confirmButtonColor: '#3085d6',
			confirmButtonText: 'OK'
		}).then((result) => {

		})
	}
	function addTowishlist(proId){
		$.ajax({
			url:'/add-Towishlist/'+proId,
			method:'get',
		
			success:(response)=>{
				if(response.msg){
					addwishlist()
					// alert(response.msg)
				}else if (response.err){
					alreadyInWish()
				}else{
					firstlogedin()
				}
				
			}  
		})
	}

	function addwishlist() {
		Swal.fire({
			title: 'Product added to wishlist!',
			icon: 'success',
			confirmButtonColor: '#3085d6',
			confirmButtonText: 'OK'
		}).then((result) => {

		})
	}
	function alreadyInWish() {
		Swal.fire({
			title: 'Item already added!',
			icon: 'warning',
			confirmButtonColor: '#3085d6',
			confirmButtonText: 'OK'
		}).then((result) => {


		}) 
	} 
	function firstlogedin() {
		Swal.fire({
			title: 'PLease login first!',
			icon: 'warning',
			confirmButtonColor: '#3085d6',
			confirmButtonText: 'OK'
		}).then((result) => {
			location.href = '/Login'

		})
	}